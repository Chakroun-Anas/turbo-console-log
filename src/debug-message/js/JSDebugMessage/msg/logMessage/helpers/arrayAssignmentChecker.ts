import ts from 'typescript';
import { TextDocument } from 'vscode';

export function arrayAssignmentChecker(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  ts.forEachChild(sourceFile, function visit(node) {
    // Case 1: const items = [1, 2, 3]
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const name = decl.name;
        const initializer = decl.initializer;

        if (!initializer) continue;

        const { line } = document.positionAt(decl.getStart());
        if (line !== selectionLine) continue;

        if (
          ts.isIdentifier(name) &&
          name.text === variableName &&
          ts.isArrayLiteralExpression(initializer)
        ) {
          isChecked = true;
          return;
        }

        if (
          ts.isArrayBindingPattern(name) &&
          ts.isArrayLiteralExpression(initializer)
        ) {
          const found = name.elements.some(
            (el) =>
              ts.isBindingElement(el) &&
              ts.isIdentifier(el.name) &&
              el.name.text === variableName,
          );
          if (found) {
            isChecked = true;
            return;
          }
        }
      }
    }

    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const left = node.expression.left;
      const right = node.expression.right;

      const startLine = document.positionAt(node.getStart()).line;
      const endLine = document.positionAt(node.getEnd()).line;
      if (selectionLine < startLine || selectionLine > endLine) return;

      if (
        ts.isArrayLiteralExpression(right) &&
        ts.isPropertyAccessExpression(left)
      ) {
        const fullName = getFullPropertyName(left);
        if (fullName === variableName) {
          isChecked = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });

  return { isChecked };
}

// 👇 Helper to get full name like "config.module.rules"
function getFullPropertyName(node: ts.PropertyAccessExpression): string {
  const parts: string[] = [];

  let current: ts.Expression = node;
  while (ts.isPropertyAccessExpression(current)) {
    parts.unshift(current.name.text);
    current = current.expression;
  }
  if (ts.isIdentifier(current)) {
    parts.unshift(current.text);
  }

  return parts.join('.');
}
