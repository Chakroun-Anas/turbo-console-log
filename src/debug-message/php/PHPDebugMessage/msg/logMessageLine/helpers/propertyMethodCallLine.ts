/**
 * Helper function to calculate the log insertion line for property method calls in chains.
 * Handles multi-line method chaining by finding the end of the entire chain expression.
 *
 * Example: $user->getName()->toLowerCase()
 * Log should be inserted after the entire chain completes.
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import { walk } from '../../php-parser-utils/walk';
import {
  isCall,
  isPropertyLookup,
  isStaticLookup,
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

/**
 * Find the outermost Call node in a chain by checking if any parent node uses this node as its "what"
 */
function findOutermostChain(targetNode: PHPNode, allNodes: PHPNode[]): PHPNode {
  let current = targetNode;
  let foundParent = true;

  // Keep looking for parents that use the current node as "what"
  while (foundParent) {
    foundParent = false;

    for (const node of allNodes) {
      if (!(isCall(node) || isPropertyLookup(node) || isStaticLookup(node))) {
        continue;
      }

      const parentWhat = node.what;
      if (!parentWhat || !parentWhat.loc || !current.loc) {
        continue;
      }

      // Check if this node's "what" is the current node (by location)
      const isParentOfCurrent =
        parentWhat.loc.start.line === current.loc.start.line &&
        parentWhat.loc.start.column === current.loc.start.column &&
        parentWhat.loc.end.line === current.loc.end.line &&
        parentWhat.loc.end.column === current.loc.end.column;

      if (isParentOfCurrent) {
        current = node;
        foundParent = true;
        break;
      }
    }
  }

  return current;
}

export function propertyMethodCallLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let line = selectionLine + 1;
  const allNodes: PHPNode[] = [];

  // Collect all nodes for parent lookup
  walk(ast, (node: PHPNode): void => {
    allNodes.push(node);
  });

  // Find the target Call node matching the selection
  walk(ast, (node: PHPNode): void => {
    if (!isCall(node)) {
      return;
    }

    const callWhat = node.what;

    // Must be a method call (has PropertyLookup or StaticLookup as what)
    if (
      !callWhat ||
      (!isPropertyLookup(callWhat) && !isStaticLookup(callWhat))
    ) {
      return;
    }

    // Check if node is on the selected line
    if (!node.loc) {
      return;
    }
    const start = node.loc.start.line - 1;
    const end = node.loc.end.line - 1;
    if (selectionLine < start || selectionLine > end) {
      return;
    }

    // Get the text representation to match against selectedVar
    const nodeText = getNodeText(node, document);
    const normalizedNodeText = nodeText.replace(/\s+/g, '').trim();
    const normalizedSelectedVar = selectedVar.replace(/\s+/g, '').trim();

    // Check if this matches the selected variable
    if (normalizedNodeText !== normalizedSelectedVar) {
      return;
    }

    // Find the outermost node in the chain
    const outermostNode = findOutermostChain(node, allNodes);

    // Get the end line of the outermost chain
    if (outermostNode.loc) {
      const endLine = outermostNode.loc.end.line - 1;
      line = endLine + 1;
    }
  });

  return line;
}
