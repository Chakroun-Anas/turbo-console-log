/**
 * Helper function to check if the selected code is an object method call assignment.
 * Example: $result = $obj->method() or $data = $user->getName()
 *
 * This differs from FunctionCallAssignment which handles standalone function calls like:
 * $result = getUser($id)
 */

import type { Program, PHPNode, Call } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import {
  isAssign,
  isVariable,
  isCall,
  isPropertyLookup,
} from '../../php-parser-utils/guards';

function getVariableName(node: PHPNode): string | null {
  if (!isVariable(node)) {
    return null;
  }
  if (typeof node.name === 'string') {
    return `$${node.name}`;
  }
  return null;
}

/**
 * Checks if a Call node is a method call (has PropertyLookup or another Call as 'what').
 * Examples:
 * - $obj->method() - Call with PropertyLookup as 'what' ✅
 * - $obj->method1()->method2() - Call with Call as 'what' ✅
 * - getUser() - Call with Identifier/Name as 'what' ❌
 */
function isMethodCall(callNode: Call): boolean {
  const { what } = callNode;

  // Method call: $obj->method()
  if (isPropertyLookup(what)) {
    return true;
  }

  // Chained method call: $obj->method1()->method2()
  if (isCall(what)) {
    return isMethodCall(what);
  }

  return false;
}

export function objectFunctionCallAssignmentChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

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

      // Check if the right side is a method call (not a standalone function call)
      if (isCall(right) && isMethodCall(right as Call)) {
        isChecked = true;
      }
    }
  });

  return { isChecked };
}
