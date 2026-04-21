/**
 * Helper function to check if the selected code is a ternary expression assignment.
 * Example: $result = $condition ? $value1 : $value2
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import { isAssign, isVariable, isTernary } from '../../php-parser-utils/guards';

function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) {
    return null;
  }
  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }
  return null;
}

export function ternaryChecker(
  ast: Program,
  _document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  walk(ast, (node: PHPNode): void => {
    if (isAssign(node)) {
      const { left, right, operator, loc } = node;

      // Only handle simple = assignment
      if (operator !== '=') {
        return;
      }

      // Check if on the selection line (convert from 1-based to 0-based)
      if (loc && loc.start.line - 1 !== selectionLine) {
        return;
      }

      // Check if the left side matches the selected variable
      const varName = getVariableName(left);
      if (varName !== selectedVar) {
        return;
      }

      // Check if the right side is a ternary expression
      if (isTernary(right)) {
        isChecked = true;
      }
    }
  });

  return { isChecked };
}
