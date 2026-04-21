/**
 * Helper function to check if the selected code is a property/method call with another method chained.
 * Example: $user->getName()->toLowerCase() where selection is "$user->getName"
 * This detects method chaining patterns common in PHP (fluent interfaces, Laravel, etc.)
 *
 * AST Structure for $user->getName()->toLowerCase():
 * - Call (toLowerCase())
 *   - what: PropertyLookup (->toLowerCase)
 *     - what: Call (getName()) <-- This is what we're looking for
 *       - what: PropertyLookup (->getName)
 *         - what: Variable ($user)
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import {
  isCall,
  isPropertyLookup,
  isStaticLookup,
  isOffsetLookup,
} from '../../php-parser-utils/guards';

/**
 * Get the text representation of a node by extracting lines from the document
 */
function getNodeText(node: PHPNode, document: TextDocument): string {
  if (!node.loc) return '';

  const startLine = node.loc.start.line - 1;
  const endLine = node.loc.end.line - 1;
  const startColumn = node.loc.start.column;
  const endColumn = node.loc.end.column;

  if (startLine === endLine) {
    return document.lineAt(startLine).text.substring(startColumn, endColumn);
  }

  // Multi-line node
  const lines: string[] = [];
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    if (i === startLine) {
      lines.push(lineText.substring(startColumn));
    } else if (i === endLine) {
      lines.push(lineText.substring(0, endColumn));
    } else {
      lines.push(lineText);
    }
  }
  return lines.join('\n');
}

export function propertyMethodCallChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  // Collect all nodes to be able to find parent relationships
  const allNodes: PHPNode[] = [];
  walk(ast, (node: PHPNode): void => {
    allNodes.push(node);
  });

  // Now check each node
  walk(ast, (node: PHPNode): void => {
    if (isChecked) return;

    // We're looking for a Call or PropertyLookup that matches the selection
    // and is used as the "what" of a parent Call/PropertyLookup/StaticLookup
    // AND must be a method/property access (not a standalone function call)
    if (!node.loc) return;

    const nodeStartLine = node.loc.start.line - 1;
    const nodeEndLine = node.loc.end.line - 1;

    // Check if selection line is within this node's range
    if (selectionLine < nodeStartLine || selectionLine > nodeEndLine) {
      return;
    }

    // Get the text of this node
    const nodeText = getNodeText(node, document);
    const normalizedNodeText = nodeText.replace(/\s+/g, '').trim();
    const normalizedSelectedVar = selectedVar.replace(/\s+/g, '').trim();

    // Check if this node matches the selection
    if (normalizedNodeText !== normalizedSelectedVar) {
      return;
    }

    // IMPORTANT: Only match intermediate parts of chains
    // Skip if this is not a chainable type
    if (
      !isCall(node) &&
      !isPropertyLookup(node) &&
      !isStaticLookup(node) &&
      !isOffsetLookup(node)
    ) {
      return;
    }

    // For a Call node, ensure it's a method call (has PropertyLookup/StaticLookup as "what")
    // This filters out standalone function calls like getName()
    if (isCall(node)) {
      const callWhat = node.what;
      if (
        !callWhat ||
        (!isPropertyLookup(callWhat) &&
          !isStaticLookup(callWhat) &&
          !isOffsetLookup(callWhat))
      ) {
        return; // Not a method call, just a standalone function call
      }
    }

    // Now check if this node is the "what" property of a parent node
    // This means it's part of a chain (intermediate, not final)
    // Also ensure the selected node is NOT the outermost node by verifying
    // there exists a LARGER parent node that contains it
    let foundAsParentWhat = false;
    let hasLargerParent = false;

    for (const potentialParent of allNodes) {
      if (
        isCall(potentialParent) ||
        isPropertyLookup(potentialParent) ||
        isStaticLookup(potentialParent)
      ) {
        // Skip if the parent is the same as this node (can't be parent of itself)
        if (
          potentialParent.loc &&
          potentialParent.loc.start.line === node.loc.start.line &&
          potentialParent.loc.start.column === node.loc.start.column &&
          potentialParent.loc.end.line === node.loc.end.line &&
          potentialParent.loc.end.column === node.loc.end.column
        ) {
          continue;
        }

        // Check if the parent's "what" property points to this node (by location matching)
        const parentWhat = potentialParent.what;
        if (parentWhat && parentWhat.loc && node.loc) {
          // Compare locations to determine if they're the same node
          if (
            parentWhat.loc.start.line === node.loc.start.line &&
            parentWhat.loc.start.column === node.loc.start.column &&
            parentWhat.loc.end.line === node.loc.end.line &&
            parentWhat.loc.end.column === node.loc.end.column
          ) {
            // This node is the "what" of a parent chain node!
            foundAsParentWhat = true;
            hasLargerParent = true;
            break;
          }
        }
      }
    }

    // Only match if this node is intermediate (has a larger parent that uses it)
    if (foundAsParentWhat && hasLargerParent) {
      isChecked = true;
    }
  });

  return { isChecked };
}
