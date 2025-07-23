import ts from 'typescript';
import { TextDocument } from 'vscode';

export function propertyAccessAssignmentLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const text = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
  );

  let insertionLine = selectionLine + 1;

  ts.forEachChild(sourceFile, function visit(node) {
    // Case 1: const foo = obj.prop;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      const nodeStart = document.positionAt(node.getStart()).line;
      const nodeEnd = document.positionAt(node.getEnd()).line;
      if (selectionLine < nodeStart || selectionLine > nodeEnd) return;

      const unwrapped = unwrap(node.initializer);
      if (
        ts.isPropertyAccessExpression(unwrapped) ||
        ts.isElementAccessExpression(unwrapped) ||
        ts.isNonNullChain(unwrapped)
      ) {
        insertionLine = nodeEnd + 1;
      }
    }

    // Case 2: this.foo = obj.prop;
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const nodeStart = document.positionAt(node.getStart()).line;
      const nodeEnd = document.positionAt(node.getEnd()).line;
      if (selectionLine < nodeStart || selectionLine > nodeEnd) return;

      const left = node.expression.left;

      if (
        ts.isPropertyAccessExpression(left) &&
        ts.isIdentifier(left.name) &&
        left.getText() === variableName
      ) {
        insertionLine = nodeEnd + 1;
      }
    }

    ts.forEachChild(node, visit);
  });

  return insertionLine;
}

function unwrap(expr: ts.Expression): ts.Expression {
  while (
    ts.isAsExpression(expr) ||
    ts.isParenthesizedExpression(expr) ||
    ts.isNonNullExpression(expr)
  ) {
    expr = expr.expression;
  }
  return expr;
}
