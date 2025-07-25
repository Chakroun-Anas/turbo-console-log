import ts from 'typescript';
import { TextDocument, Position } from 'vscode';

export function rawPropertyAccessLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(variableName);
  if (charIndex === -1) return selectionLine + 1;

  const offsetStart = document.offsetAt(new Position(selectionLine, charIndex));
  const offsetEnd = offsetStart + variableName.length;

  let foundNode: ts.Node | undefined;

  function visit(node: ts.Node) {
    const nodeStart = node.getFullStart();
    const nodeEnd = node.getEnd();

    if (nodeStart <= offsetStart && nodeEnd >= offsetEnd) {
      if (ts.isPropertyAssignment(node) && !foundNode) {
        foundNode = node;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!foundNode) {
    return selectionLine + 1;
  }

  // Walk up to the top-level VariableDeclaration or VariableStatement
  let current: ts.Node | undefined = foundNode;
  while (
    current &&
    !ts.isVariableStatement(current) &&
    !ts.isVariableDeclaration(current)
  ) {
    current = current.parent;
  }

  if (current) {
    const endPos = document.positionAt(current.getEnd());
    return endPos.line + 1;
  }

  return selectionLine + 1;
}
