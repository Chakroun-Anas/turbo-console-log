import ts from 'typescript';
import { TextDocument } from 'vscode';

export function wanderingExpressionLine(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  let bestEndOffset = -1;

  function isDeclaration(node: ts.Node): boolean {
    const parent = node.parent;
    return (
      (ts.isVariableDeclaration(parent) && parent.name === node) ||
      (ts.isParameter(parent) && parent.name === node) ||
      (ts.isPropertyAssignment(parent) && parent.name === node)
    );
  }

  function containsVariableName(node: ts.Node): boolean {
    return (
      (ts.isIdentifier(node) && node.text === variableName) ||
      (ts.isPropertyAccessExpression(node) &&
        node.getText().endsWith(variableName))
    );
  }

  function visit(node: ts.Node): void {
    const startLine = document.positionAt(node.getStart()).line;
    const endLine = document.positionAt(node.getEnd()).line;

    const isInRange = selectionLine >= startLine && selectionLine <= endLine;

    if (!isInRange) {
      ts.forEachChild(node, visit);
      return;
    }

    // If this node contains the variable and isn't a declaration
    if (containsVariableName(node) && !isDeclaration(node)) {
      // Climb up to the outermost expression if possible
      let top = node;
      while (
        top.parent &&
        top.parent.getStart() === node.getStart() &&
        top.parent.getEnd() >= node.getEnd()
      ) {
        top = top.parent;
      }

      const topEndOffset = top.getEnd();
      if (topEndOffset > bestEndOffset) {
        bestEndOffset = topEndOffset;
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);

  if (bestEndOffset === -1) return selectionLine + 1;

  const { line } = document.positionAt(bestEndOffset);
  return line + 1;
}
