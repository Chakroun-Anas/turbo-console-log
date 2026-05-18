/**
 * Helper function to check if the selected variable is within a return statement.
 * Handles simple returns, multi-line returns, and complex expressions.
 * Example: return $value; or return $user->name;
 */

import type { Program, PHPNode, Return } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import { isReturn } from '../../php-parser-utils/guards';

/**
 * Check if a node or its descendants contain a reference to the target variable
 */
function containsVariable(
  node: PHPNode,
  variableName: string,
  document: TextDocument,
  selectionLine: number,
  visited = new Set<PHPNode>(),
  depth = 0,
): boolean {
  if (!node) return false;

  // Safeguard against infinite recursion
  const MAX_DEPTH = 100;
  if (depth >= MAX_DEPTH || visited.has(node)) {
    return false;
  }
  visited.add(node);

  // Position-based matching: if selection line is within this node's range
  if (node.loc) {
    const start = node.loc.start.line - 1;
    const end = node.loc.end.line - 1;

    if (selectionLine >= start && selectionLine <= end) {
      // Get the text of this node by examining the lines
      const lines: string[] = [];
      for (let i = start; i <= end; i++) {
        lines.push(document.lineAt(i).text);
      }
      const nodeText = lines.join('\n');

      // Check if the variable name appears in this node's text
      if (nodeText.includes(variableName)) {
        return true;
      }
    }
  }

  // Recursively check children
  let found = false;
  walk(node, (child: PHPNode) => {
    if (found || child === node) return;
    if (
      containsVariable(
        child,
        variableName,
        document,
        selectionLine,
        visited,
        depth + 1,
      )
    ) {
      found = true;
    }
  });

  return found;
}

export function withinReturnStatementChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  walk(ast, (node: PHPNode): void => {
    if (isChecked) return;

    if (isReturn(node)) {
      const returnNode = node as Return;

      // Check if the return statement has an expression
      if (returnNode.expr) {
        // Check if selection line is within the return statement
        if (node.loc) {
          const start = node.loc.start.line - 1;
          const end = node.loc.end.line - 1;

          if (selectionLine >= start && selectionLine <= end) {
            // Check if the return expression contains the target variable
            if (
              containsVariable(
                returnNode.expr,
                selectedVar,
                document,
                selectionLine,
              )
            ) {
              isChecked = true;
            }
          }
        }
      }
    }
  });

  return { isChecked };
}
