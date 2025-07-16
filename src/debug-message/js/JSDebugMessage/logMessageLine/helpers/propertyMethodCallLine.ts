import ts from 'typescript';
import { Position, TextDocument } from 'vscode';

export function propertyMethodCallLine(
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): number {
  const sourceText = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  // locate the exact selection in the line
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(selectedText);
  if (charIndex === -1) {
    // fallback: just insert on the next line
    return selectionLine + 1;
  }

  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;

  let insertionLine = selectionLine + 1;

  function visit(node: ts.Node) {
    // look for a call expression whose object matches our selectedText
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.expression.getText(sourceFile) === selectedText &&
        callee.expression.getStart(sourceFile) <= startOffset &&
        callee.expression.getEnd() >= endOffset
      ) {
        // place insertion right after the call ends
        const pos = document.positionAt(node.getEnd());
        insertionLine = pos.line + 1;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return insertionLine;
}
