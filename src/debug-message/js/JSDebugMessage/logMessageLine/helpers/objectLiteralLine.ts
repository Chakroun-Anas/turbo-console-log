import ts from 'typescript';
import { TextDocument } from 'vscode';

export function objectLiteralLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const code = document.getText();
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let insertionLine = selectionLine + 1;
  let found = false;

  function visit(node: ts.Node) {
    if (found) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
        node.initializer.getStart(),
      );
      const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(
        node.initializer.getEnd(),
      );
      if (selectionLine >= startLine && selectionLine <= endLine) {
        insertionLine = endLine + 1;
        found = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return insertionLine;
}
