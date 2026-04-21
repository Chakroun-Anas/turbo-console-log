/**
 * Helper function to check if the selected code is a property access assignment.
 * Example: $name = $user->name or $value = $this->property
 */

import type {
  Program,
  PHPNode,
  PropertyLookup,
} from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';
import {
  isAssign,
  isVariable,
  isPropertyLookup,
  isCall,
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
 * Recursively checks if a property lookup chain contains any method calls.
 * Returns true if there's a Call node in the chain (e.g., $this->getUser()->name)
 */
function containsMethodCall(node: PHPNode): boolean {
  if (isCall(node)) {
    return true;
  }

  // Check if it's a property lookup and recurse on the what (the object part)
  if (isPropertyLookup(node)) {
    const propLookup = node as PropertyLookup;
    if (propLookup.what) {
      return containsMethodCall(propLookup.what);
    }
  }

  return false;
}

export function propertyAccessAssignmentChecker(
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

      // Check if the right side is a property lookup WITHOUT method calls
      // $user->name ✅  |  $this->getUser()->name ❌ (has method call)
      if (isPropertyLookup(right) && !containsMethodCall(right)) {
        isChecked = true;
      }
    }
  });

  return { isChecked };
}
