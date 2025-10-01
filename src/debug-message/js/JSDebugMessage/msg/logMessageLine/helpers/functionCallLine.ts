import { TextDocument } from 'vscode';
import {
  type AcornNode,
  type VariableDeclaration,
  isIdentifier,
  isCallExpression,
  isAwaitExpression,
  isTSAsExpression,
  isParenthesizedExpression,
  isMemberExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isObjectPattern,
  isArrayPattern,
  isLogicalExpression,
  walk,
} from '../../acorn-utils';

function getFullExpressionEnd(initializer: AcornNode): number {
  const current: AcornNode = initializer;

  // Go up while parent is part of the expression (e.g. .catch, .then, etc.)
  // In Acorn, we need to walk the tree to find the outermost relevant expression
  // Since Acorn doesn't have parent pointers, we'll calculate the end differently
  // by finding the maximum end position of all child nodes

  let maxEnd = current.end || 0;

  walk(current, (node: AcornNode) => {
    if (node.end && node.end > maxEnd) {
      maxEnd = node.end;
    }
  });

  return maxEnd;
}

export function functionCallLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let targetEnd = -1;
  const code = document.getText();

  walk(ast, (node: AcornNode): boolean | void => {
    // Handle variable declarations
    if (node.type === 'VariableDeclaration') {
      const varDecl = node as VariableDeclaration;

      for (const decl of varDecl.declarations) {
        if (decl.start === undefined || decl.end === undefined) continue;

        const isIdentifierMatch =
          isIdentifier(decl.id) && decl.id.name === variableName;

        const isDestructuring =
          isObjectPattern(decl.id) || isArrayPattern(decl.id);

        if (!isIdentifierMatch && !isDestructuring) {
          continue;
        }

        const initializer = decl.init;
        if (!initializer) continue;

        const isRelevantCall = containsFunctionCall(initializer);

        if (!isRelevantCall) continue;

        // Use the VariableDeclaration's range for selection check, not the declarator's
        if (node.start === undefined || node.end === undefined) continue;

        const startLine = document.positionAt(node.start).line;
        const endLine = document.positionAt(node.end).line;

        if (selectionLine >= startLine && selectionLine <= endLine) {
          targetEnd = getFullExpressionEnd(initializer);
          return true;
        }
      }
    }

    // Handle assignment expressions: variable = functionCall()
    if (isExpressionStatement(node)) {
      const expr = (node as { expression?: AcornNode }).expression;
      if (expr && isAssignmentExpression(expr)) {
        const assignment = expr as {
          operator: string;
          left?: AcornNode;
          right?: AcornNode;
        };

        // Only handle '=' assignments
        if (assignment.operator !== '=') return;

        const { left, right } = assignment;
        if (!left || !right) return;

        // Match left side: identifier or member/element access
        let leftText = '';
        if (isIdentifier(left)) {
          leftText = left.name;
        } else if (
          isMemberExpression(left) &&
          left.start !== undefined &&
          left.end !== undefined
        ) {
          leftText = code.substring(left.start, left.end);
        }

        if (leftText === variableName && isCallExpression(right)) {
          if (node.start === undefined || node.end === undefined) return;

          const startLine = document.positionAt(node.start).line;
          const endLine = document.positionAt(node.end).line;

          if (selectionLine >= startLine && selectionLine <= endLine) {
            targetEnd = node.end;
            return true;
          }
        }
      }
    }
  });

  if (targetEnd === -1) return selectionLine + 1;

  const { line: endLine } = document.positionAt(targetEnd);
  return endLine + 1;
}

/**
 * Recursively checks if an expression contains any function call,
 * handling complex nested expressions with await, logical operators, etc.
 */
function containsFunctionCall(expr: AcornNode): boolean {
  if (!expr) return false;

  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000;
  let depth = 0;

  function check(node: AcornNode): boolean {
    if (!node || visited.has(node) || depth++ >= MAX_DEPTH) return false;
    visited.add(node);

    // Direct function call
    if (isCallExpression(node)) return true;

    // Await expression: check the awaited expression
    if (isAwaitExpression(node)) {
      return check(node.argument);
    }

    // Logical expression: check both sides
    if (isLogicalExpression(node)) {
      return check(node.left) || check(node.right);
    }

    // Unwrap type assertions and parentheses
    if (isTSAsExpression(node) || isParenthesizedExpression(node)) {
      return check(node.expression);
    }

    return false;
  }

  return check(expr);
}
