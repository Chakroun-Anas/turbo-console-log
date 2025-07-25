import ts from 'typescript';
import { TextDocument } from 'vscode';

export function arrayLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let targetEnd = -1;

  ts.forEachChild(sourceFile, function visit(node) {
    // Handle direct variable assignment (const a = [...])
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const line = document.positionAt(decl.getStart()).line;
        if (line !== selectionLine || !decl.initializer) continue;

        const nameText = decl.name.getText();
        const matches = nameText === variableName;

        if (matches && ts.isArrayLiteralExpression(decl.initializer)) {
          targetEnd = decl.initializer.getEnd();
          return;
        }
      }
    }

    // Handle direct property assignment (config.module.rules = [...])
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression)
    ) {
      const { left, right } = node.expression;
      const line = document.positionAt(node.getStart()).line;

      if (
        line === selectionLine &&
        left.getText() === variableName &&
        ts.isArrayLiteralExpression(right)
      ) {
        targetEnd = right.getEnd();
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  if (targetEnd === -1) return selectionLine + 1;

  const { line } = document.positionAt(targetEnd);
  return line + 1;
}
