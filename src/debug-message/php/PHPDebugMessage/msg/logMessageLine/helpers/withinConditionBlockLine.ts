/**
 * Helper function to calculate the line where the log message should be inserted
 * for variables within if statement conditions.
 * The log is inserted BEFORE the if statement to show the variable's value before evaluation.
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import { walk } from '../../php-parser-utils/walk';
import { isIf } from '../../php-parser-utils/guards';

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

export function withinConditionBlockLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let targetLine = selectionLine + 1;

  walk(ast, (node: PHPNode): void => {
    // Only handle if statement conditions (including elseif)
    if (isIf(node)) {
      const ifNode = node;

      if (ifNode.test && ifNode.loc) {
        // Check if the selection is within the test condition
        const testStart = ifNode.test.loc!.start.line - 1;
        const testEnd = ifNode.test.loc!.end.line - 1;

        if (selectionLine >= testStart && selectionLine <= testEnd) {
          // Check if the variable appears in the condition
          if (
            containsVariable(ifNode.test, selectedVar, document, selectionLine)
          ) {
            // Insert before the if statement (at the start of the if)
            targetLine = ifNode.loc.start.line - 1;
            return;
          }
        }
      }
    }
  });

  return targetLine;
}
