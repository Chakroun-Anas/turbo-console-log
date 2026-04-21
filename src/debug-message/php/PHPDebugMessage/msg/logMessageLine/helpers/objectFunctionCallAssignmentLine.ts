/**
 * Helper function to calculate the log insertion line for object method call assignments.
 * Handles multi-line method call chains by finding the end of the call expression.
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import { walk } from '../../php-parser-utils/walk';
import { isAssign, isVariable } from '../../php-parser-utils/guards';

function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) {
    return null;
  }
  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }
  return null;
}

export function objectFunctionCallAssignmentLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let line = selectionLine + 1;

  walk(ast, (node: PHPNode): void => {
    if (isAssign(node)) {
      const { left, right, operator } = node;

      // Only handle simple = assignment
      if (operator !== '=') {
        return;
      }

      const varName = getVariableName(left);
      if (varName !== selectedVar) {
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

      // Get the end line of the right-hand side (method call chain)
      if (right.loc) {
        const endLine = right.loc.end.line - 1;
        line = endLine + 1;
      }
    }
  });

  return line;
}
