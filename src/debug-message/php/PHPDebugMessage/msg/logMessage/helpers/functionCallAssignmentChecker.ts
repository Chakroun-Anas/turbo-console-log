/**
 * Helper function to check if the selected code is a standalone function call assignment.
 * Example: $result = getUser($id) or $data = array_map($fn, $arr)
 *
 * NOTE: This does NOT handle method calls like $obj->method()
 * Those are handled by ObjectFunctionCallAssignmentChecker
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
 * Checks if a Call node is a standalone function call (not a method call).
 * Examples:
 * - getUser($id) - Call with Identifier/Name as 'what' ✅
 * - array_map($fn, $arr) - Call with Name as 'what' ✅
 * - $obj->method() - Call with PropertyLookup as 'what' ❌
 * - $obj->method1()->method2() - Call with Call as 'what' ❌
 */
function isStandaloneFunctionCall(callNode: Call): boolean {
  const { what } = callNode;

  // Method call: $obj->method()
  if (isPropertyLookup(what)) {
    return false;
  }

  // Chained method call: $obj->method1()->method2()
  if (isCall(what)) {
    return false;
  }

  // Standalone function call: getUser() or array_map()
  return true;
}

export function functionCallAssignmentChecker(
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

      // Check if the right side is a standalone function call (NOT a method call)
      // getUser($id) ✅  |  $obj->method() ❌ (method call)
      if (isCall(right) && isStandaloneFunctionCall(right as Call)) {
        isChecked = true;
      }
    }
  });

  return { isChecked };
}
