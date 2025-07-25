import ts from 'typescript';
import { TextDocument } from 'vscode';

export function propertyAccessAssignmentChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node) {
    // Case ①: const value = obj.prop;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      const declLine = document.positionAt(node.getStart()).line;
      if (declLine !== selectionLine) return;

      const init = unwrap(node.initializer);
      if (
        ts.isPropertyAccessExpression(init) ||
        ts.isElementAccessExpression(init) ||
        isOptionalChain(init)
      ) {
        isChecked = true;
        return;
      }
    }

    // Case ②: $scope.users = something;
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const { left } = node.expression;
      const declLine = document.positionAt(node.getStart()).line;
      if (declLine !== selectionLine) return;

      if (
        ts.isPropertyAccessExpression(left) &&
        left.getText() === variableName
      ) {
        isChecked = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}

function unwrap(expr: ts.Expression): ts.Expression {
  while (ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
    expr = expr.expression;
  }
  return expr;
}

function isOptionalChain(node: ts.Expression): boolean {
  return ts.isPropertyAccessChain(node) || ts.isElementAccessChain(node);
}
