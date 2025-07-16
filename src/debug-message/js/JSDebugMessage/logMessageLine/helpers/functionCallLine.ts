import ts from 'typescript';
import { TextDocument } from 'vscode';

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
          ts.isCallExpression(initializer.expression));

      if (!isRelevantCall) return;

      const { line } = document.positionAt(node.getStart());

      if (line === selectionLine) {
        targetEnd = node.getEnd();
        return;
      }
    }

    ts.forEachChild(node, visit);
  });

  if (targetEnd === -1) return selectionLine + 1;

  const { line: endLine } = document.positionAt(targetEnd);
  return endLine + 1;
}
