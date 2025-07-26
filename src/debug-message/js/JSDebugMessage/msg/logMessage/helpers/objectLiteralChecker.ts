import ts from 'typescript';
import { TextDocument } from 'vscode';

export function objectLiteralChecker(
  sourceFile: ts.SourceFile,
  _document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const declLine = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      ).line;
      if (declLine === selectionLine) {
        isChecked = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { isChecked };
}
