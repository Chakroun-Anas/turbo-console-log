/**
 * Helper function to calculate the log insertion line for function parameters.
 * The log should be inserted at the beginning of the function body (after the opening brace).
 */

import type { Program, PHPNode } from '../../php-parser-utils/types';
import type { TextDocument } from 'vscode';
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
 * Extracts the parameter name from a parameter node
 */
function getParameterName(param: PHPNode): string | null {
  if (param.kind !== 'parameter') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paramAny = param as any;

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

export function functionParameterLine(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let line = selectionLine + 1;

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

    // Check if the function has the parameter we're looking for
    if (!('arguments' in node) || !Array.isArray(node.arguments)) {
      return;
    }

    let hasParameter = false;
    for (const param of node.arguments) {
      const paramName = getParameterName(param);
      if (paramName === selectedVar) {
        hasParameter = true;
        break;
      }
    }

    if (!hasParameter) {
      return;
    }

    // For arrow functions, insert after the arrow
    if (node.kind === 'arrowfunc') {
      // Arrow functions don't have a block body in the traditional sense
      // The log should go after the entire arrow function
      line = end + 1;
      return;
    }

    // For regular functions/methods/closures, get the body block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeAny = node as any;
    if (nodeAny.body && nodeAny.body.kind === 'block' && nodeAny.body.loc) {
      // Insert at the line after the opening brace of the function body
      const bodyStart = nodeAny.body.loc.start.line - 1;
      line = bodyStart + 1;
    }
  });

  return line;
}
