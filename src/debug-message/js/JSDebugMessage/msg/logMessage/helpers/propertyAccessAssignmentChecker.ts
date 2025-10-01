import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isMemberExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isChainExpression,
  isParenthesizedExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  walk,
} from '../../acorn-utils';

/**
 * Helper function to unwrap type assertions and parentheses
 */
function unwrap(node: AcornNode): AcornNode {
  let current = node;
  const visited = new Set<AcornNode>();
  let depth = 0;
  const MAX_DEPTH = 1000;

  while (
    isParenthesizedExpression(current) ||
    isTSAsExpression(current) ||
    isTSTypeAssertion(current)
  ) {
    // Safeguards against infinite loops
    if (depth >= MAX_DEPTH) {
      console.warn(
        `unwrap: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
      );
      return current;
    }
    if (visited.has(current)) {
      return current;
    }
    visited.add(current);
    depth++;

    current = (current as { expression?: AcornNode }).expression || current;
  }
  return current;
}

/**
 * Helper function to check if a node is a property/element access or optional chain
 */
function isPropertyOrElementAccess(node: AcornNode): boolean {
  const unwrapped = unwrap(node);
  return isMemberExpression(unwrapped) || isChainExpression(unwrapped);
}

/**
 * Helper function to get the full text representation of a member expression chain
 */
function getMemberExpressionText(node: AcornNode, sourceCode: string): string {
  if (!node.start || !node.end) return '';
  return sourceCode.substring(node.start, node.end);
}

export function propertyAccessAssignmentChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Case ①: const value = obj.prop;
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;

        const startLine = decl.loc.start.line - 1; // Acorn uses 1-based lines

        if (startLine !== selectionLine || !decl.init) continue;

        const { id, init } = decl;

        if (
          isIdentifier(id) &&
          id.name === variableName &&
          isPropertyOrElementAccess(init)
        ) {
          isChecked = true;
          return true;
        }
      }
    }

    // Case ②: $scope.users = something;
    if (isExpressionStatement(node)) {
      const expr = node.expression;
      if (!expr.loc) return;

      const startLine = expr.loc.start.line - 1;

      if (startLine !== selectionLine) return;

      if (isAssignmentExpression(expr)) {
        const { left, operator } = expr as {
          left: AcornNode;
          operator?: string;
        };

        if (
          operator === '=' &&
          isMemberExpression(left) &&
          getMemberExpressionText(left, sourceCode) === variableName
        ) {
          isChecked = true;
          return true;
        }
      }
    }
  });

  return { isChecked };
}
