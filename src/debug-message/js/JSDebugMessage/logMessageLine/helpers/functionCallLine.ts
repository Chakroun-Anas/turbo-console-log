import ts from 'typescript';
import { TextDocument } from 'vscode';

function getFullExpressionEnd(initializer: ts.Expression): number {
  let current: ts.Node = initializer;

  // Go up while parent is part of the expression (e.g. .catch, .then, etc.)
  while (
    current.parent &&
    (ts.isCallExpression(current.parent) ||
      ts.isPropertyAccessExpression(current.parent) ||
      ts.isAwaitExpression(current.parent) ||
      ts.isAsExpression(current.parent) ||
      ts.isParenthesizedExpression(current.parent))
  ) {
    current = current.parent;
  }

  return current.end;
}

export function functionCallLine(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
): number {
  const sourceFile = ts.createSourceFile(
    'file.ts',
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let targetEnd = -1;

  ts.forEachChild(sourceFile, function visit(node: ts.Node): void {
    if (ts.isVariableDeclaration(node)) {
      const isIdentifier =
        ts.isIdentifier(node.name) && node.name.text === variableName;

      const isDestructuring =
        ts.isObjectBindingPattern(node.name) ||
        ts.isArrayBindingPattern(node.name);

      if (!isIdentifier && !isDestructuring) {
        ts.forEachChild(node, visit);
        return;
      }

      const initializer = node.initializer;
      if (!initializer) return;

      const isRelevantCall =
        ts.isCallExpression(initializer) ||
        (ts.isAsExpression(initializer) &&
          ts.isCallExpression(initializer.expression)) ||
        (ts.isParenthesizedExpression(initializer) &&
          ts.isCallExpression(initializer.expression)) ||
        ts.isAwaitExpression(initializer);

      if (!isRelevantCall) return;

      const startLine = document.positionAt(node.getStart()).line;
      const endLine = document.positionAt(node.getEnd()).line;

      if (selectionLine >= startLine && selectionLine <= endLine) {
        targetEnd = getFullExpressionEnd(initializer);
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  if (targetEnd === -1) return selectionLine + 1;

  const { line: endLine } = document.positionAt(targetEnd);
  return endLine + 1;
}
