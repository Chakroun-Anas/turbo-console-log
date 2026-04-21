/**
 * Helper function to check if the selected code is a function parameter.
 * Example: function getUser($userId) { ... }
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
import type { PHPLogMessageCheckerResult } from '../phpLogMessageTypes';
import { walk } from '../../php-parser-utils/walk';

/**
 * Checks if a node is a function-like construct (function, method, closure, arrow function)
 */
function isFunctionLike(node: PHPNode): boolean {
  return (
    node.kind === 'function' ||
    node.kind === 'method' ||
    node.kind === 'closure' ||
    node.kind === 'arrowfunc'
  );
}

/**
 * Extracts the parameter name from a parameter node, handling references and variadic
 */
function getParameterName(param: PHPNode): string | null {
  if (param.kind !== 'parameter') {
    return null;
  }

  // Handle both byref and variadic parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paramAny = param as any;

  // In php-parser, param.name can be:
  // 1. An identifier object with { kind: 'identifier', name: 'paramName' }
  // 2. A string 'paramName'
  if (paramAny.name) {
    if (
      typeof paramAny.name === 'object' &&
      paramAny.name.kind === 'identifier'
    ) {
      return `$${paramAny.name.name}`;
    } else if (typeof paramAny.name === 'string') {
      return `$${paramAny.name}`;
    }
  }

  return null;
}

export function functionParameterChecker(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessageCheckerResult {
  let isChecked = false;

  walk(ast, (node: PHPNode): void => {
    if (!isFunctionLike(node)) {
      return;
    }

    // Check if node is on or contains the selected line
    if (!node.loc) {
      return;
    }

    const start = node.loc.start.line - 1;
    const end = node.loc.end.line - 1;
    if (selectionLine < start || selectionLine > end) {
      return;
    }

    // Check if the function has arguments/parameters
    if (!('arguments' in node) || !Array.isArray(node.arguments)) {
      return;
    }

    // Check if selectedVar matches any parameter
    for (const param of node.arguments) {
      const paramName = getParameterName(param);
      if (paramName === selectedVar) {
        isChecked = true;
        return;
      }
    }
  });

  return { isChecked };
}
