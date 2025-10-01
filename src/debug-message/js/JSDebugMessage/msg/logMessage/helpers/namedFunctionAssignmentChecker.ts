import { LogMessage } from '@/entities';
import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isFunctionExpression,
  isArrowFunctionExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

export function namedFunctionAssignmentChecker(
  ast: AcornNode,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  if (!ast) {
    return {
      isChecked: false,
      metadata: { line: selectionLine } as Pick<LogMessage, 'metadata'>,
    };
  }

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Handle: const myFn = function() {} or const myFn = () => {}
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;

        const line = decl.loc.start.line - 1; // Acorn uses 1-based lines
        if (line !== selectionLine) continue;

        const { id, init } = decl;
        if (
          isIdentifier(id) &&
          id.name === variableName &&
          init &&
          (isFunctionExpression(init) || isArrowFunctionExpression(init))
        ) {
          isChecked = true;
          return true;
        }
      }
    }

    // Handle: obj.myFn = function() {} or obj.myFn = () => {}
    if (isExpressionStatement(node)) {
      const expr = node.expression;
      if (!expr.loc) return;

      const line = expr.loc.start.line - 1;
      if (line !== selectionLine) return;

      if (
        isAssignmentExpression(expr) &&
        isMemberExpression(expr.left) &&
        isIdentifier(expr.left.property) &&
        expr.left.property.name === variableName &&
        (isFunctionExpression(expr.right) ||
          isArrowFunctionExpression(expr.right))
      ) {
        isChecked = true;
        return true;
      }
    }
  });

  return {
    isChecked,
    metadata: { line: selectionLine } as Pick<LogMessage, 'metadata'>,
  };
}
