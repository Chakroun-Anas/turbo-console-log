import { TextDocument } from 'vscode';
import { Program, PHPNode } from '../../php-parser-utils/types';
import { walk } from '../../php-parser-utils/walk';
import { isAssign, isVariable } from '../../php-parser-utils/guards';

/**
 * Extracts the variable name from a PHP variable node.
 * Handles both simple variables ($var) and dynamic variables (${expr}).
 */
function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) return null;

  // Simple variable: name is a string
  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }

  return null;
}

export function arrayAssignmentLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let line = selectionLine + 1;

  if (!ast) {
    return line;
  }

  walk(ast, (node: PHPNode): void => {
    // Check for assignment: $var = value
    if (isAssign(node)) {
      const { left, right, operator } = node;

      // Only handle simple assignment (=), not +=, -=, etc.
      if (operator !== '=') return;

      // Check if left side is the variable we're looking for
      const varName = getVariableName(left);
      if (varName !== selectedVar) return;

      // Check if this assignment is on the selection line
      if (!node.loc) return;

      const start = node.loc.start.line - 1; // php-parser uses 1-based lines
      const end = node.loc.end.line - 1;

      if (selectionLine < start || selectionLine > end) return;

      // Calculate the line after the right side expression ends
      if (right.loc) {
        const endLine = right.loc.end.line - 1;
        line = endLine + 1;
      }
    }
  });

  return line;
}
