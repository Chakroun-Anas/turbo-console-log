import ts from 'typescript';
import { TextDocument } from 'vscode';

export function primitiveAssignmentLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
  );

  let line = selectionLine + 1;

  ts.forEachChild(sourceFile, function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      const start = document.positionAt(node.getStart()).line;
      const end = document.positionAt(node.getEnd()).line;
      if (selectionLine < start || selectionLine > end) return;

      const endLine = document.positionAt(node.initializer.getEnd()).line;
      line = endLine + 1;
    }

    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name)
    ) {
      const binding = node.name.elements.find(
        (el) => ts.isIdentifier(el.name) && el.name.text === variableName,
      );

      if (binding && node.initializer) {
        const start = document.positionAt(node.getStart()).line;
        const end = document.positionAt(node.getEnd()).line;
        if (selectionLine < start || selectionLine > end) return;

        const endLine = document.positionAt(node.initializer.getEnd()).line;
        line = endLine + 1;
      }
    }

    ts.forEachChild(node, visit);
  });

  return line;
}
