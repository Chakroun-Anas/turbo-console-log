/**
 * Helper function to calculate the log insertion line for string interpolation.
 * Handles multi-line interpolated strings by finding the end of the string.
 *
 * Example: $message = "Hello $name"
 * Log should be inserted after the entire string completes.
 */

import type { Program, PHPNode, Assign } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import { walk } from '../../php-parser-utils/walk';
import { isEncapsed, isVariable } from '../../php-parser-utils/guards';

function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) {
    return null;
  }
  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }
  return null;
}

export function stringInterpolationLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let line = selectionLine + 1;

  walk(ast, (node: PHPNode): void => {
    if (node.kind !== 'assign') {
      return;
    }

    const assign = node as Assign;

    // Only handle simple = assignment
    if (assign.operator !== '=') {
      return;
    }

    const varName = getVariableName(assign.left);
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

    // Check if the right side is an interpolated string (Encapsed)
    if (isEncapsed(assign.right)) {
      // Get the end line of the interpolated string
      if (assign.right.loc) {
        const endLine = assign.right.loc.end.line - 1;
        line = endLine + 1;
      }
    } else if (assign.right.loc) {
      // Fallback to right side end line
      const endLine = assign.right.loc.end.line - 1;
      line = endLine + 1;
    }
  });

  return line;
}
