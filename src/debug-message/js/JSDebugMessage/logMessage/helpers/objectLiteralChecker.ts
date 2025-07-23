import ts from 'typescript';
import { TextDocument } from 'vscode';

export function objectLiteralChecker(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  const code = document.getText();
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

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
