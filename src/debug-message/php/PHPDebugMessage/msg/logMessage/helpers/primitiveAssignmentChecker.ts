/**
 * Helper function to check if the selected code represents a PHP primitive variable assignment.
 * Example: $user = "John"; $count = 42; $isActive = true;
 */

import type { TextDocument } from 'vscode';
import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import {
  isAssign,
  isVariable,
  isLiteral,
  isUnary,
} from '../../php-parser-utils/guards';
import { walk } from '../../php-parser-utils/walk';

/**
 * Checks if a PHP node represents a primitive value (string, number, boolean, null).
 */
function isPrimitiveRHS(expr: PHPNode): boolean {
  // Literal values: strings, numbers, booleans
  // In php-parser, these are unified under kinds: 'string', 'number', 'boolean'
  if (isLiteral(expr)) {
    return true;
  }

  // null keyword
  if (expr.kind === 'nullkeyword') {
    return true;
  }

  // Unary expressions for negative numbers: -10, +5
  // Only allow unary - or + with a number literal
  if (isUnary(expr)) {
    const { type, what } = expr;
    if ((type === '-' || type === '+') && what.kind === 'number') {
      return true;
    }
  }

  return false;
}

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

/**
 * Checks if the selection is a primitive assignment.
 *
 * @param ast The PHP AST Program node
 * @param document The VS Code TextDocument (unused for now, matches signature)
 * @param selectionLine The line number where the selection is (0-based)
 * @param selectedVar The selected variable text (e.g., "$user")
 * @returns Result indicating if this is a primitive assignment
 */
export function primitiveAssignmentChecker(
  ast: Program,
  _document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  if (!ast) {
    return { isChecked: false };
  }

  walk(ast, (node: PHPNode): boolean | void => {
    if (isChecked) return true;

    // Check if node has location information
    if (!node.loc) return;

    const start = node.loc.start.line - 1; // php-parser uses 1-based lines
    const end = node.loc.end.line - 1;

    if (selectionLine < start || selectionLine > end) return;

    // Check for assignment: $var = value
    if (isAssign(node)) {
      const { left, right, operator } = node;

      // Only handle simple assignment (=), not +=, -=, etc.
      if (operator !== '=') return;

      // Check if right side is a primitive value
      if (!isPrimitiveRHS(right)) return;

      // Check if left side is the variable we're looking for
      const varName = getVariableName(left);
      if (varName === selectedVar) {
        isChecked = true;
        return true;
      }
    }
  });

  return { isChecked };
}
