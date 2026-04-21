/**
 * Helper function to check if the selected code represents a PHP array assignment.
 * Example: $data = array(1, 2, 3); or $data = [1, 2, 3];
 */

import type { TextDocument } from 'vscode';
import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { isAssign, isVariable, isArray } from '../../php-parser-utils/guards';
import { walk } from '../../php-parser-utils/walk';

/**
 * Extracts the variable name from a PHP variable node.
 */
function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) return null;

  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }

  return null;
}

/**
 * Checks if the selection is an array assignment.
 *
 * @param ast The PHP AST Program node
 * @param document The VS Code TextDocument
 * @param selectionLine The line number where the selection is (0-based)
 * @param selectedVar The selected variable text (e.g., "$data")
 * @returns Result indicating if this is an array assignment
 */
export function arrayAssignmentChecker(
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

      // Check if right side is an array
      if (!isArray(right)) return;

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
