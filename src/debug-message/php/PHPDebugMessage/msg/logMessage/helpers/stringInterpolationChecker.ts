/**
 * Helper function to check if the selected code is a string with interpolation.
 *
 * PHP string interpolation patterns:
 * - Simple variable: "Hello $name"
 * - Property access: "Name: $user->name"
 * - Array elements: "Item: $items[0]"
 * - Complex expressions: "Total: {$price * $quantity}"
 *
 * Note: Single-quoted strings ('...') do NOT support interpolation in PHP
 */

import type { Program, PHPNode, Assign } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
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

export function stringInterpolationChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  walk(ast, (node: PHPNode): void => {
    if (isChecked) return;

    // We're looking for an assignment where the right side is an Encapsed node
    if (node.kind !== 'assign') {
      return;
    }

    // Type assertion after kind check
    const assign = node as Assign;

    // Only handle simple = assignment
    if (assign.operator !== '=') {
      return;
    }

    // Check if the right side is an interpolated string (Encapsed)
    if (!isEncapsed(assign.right)) {
      return;
    }

    // Check if left side is the variable we're looking for
    const varName = getVariableName(assign.left);
    if (varName !== selectedVar) {
      return;
    }

    // Check if this assignment is on the selection line
    if (!node.loc) {
      return;
    }
    const start = node.loc.start.line - 1;
    const end = node.loc.end.line - 1;

    if (selectionLine < start || selectionLine > end) {
      return;
    }

    isChecked = true;
  });

  return { isChecked };
}
