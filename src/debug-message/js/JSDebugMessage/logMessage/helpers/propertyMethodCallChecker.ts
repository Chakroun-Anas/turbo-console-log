import ts from 'typescript';
import { TextDocument, Position } from 'vscode';

export function propertyMethodCallChecker(
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
) {
  const sourceText = document.getText();
  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  // locate the selection in the source
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(selectedText);
  if (charIndex === -1) return { isChecked: false };

  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;

  let isChecked = false;

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee)) {
        const objectExpr = callee.expression;
        const objectText = objectExpr.getText(sourceFile);

        if (
          objectText === selectedText &&
          objectExpr.getStart(sourceFile) <= startOffset &&
          objectExpr.getEnd() >= endOffset
        ) {
          isChecked = true;
          return; // we found our match, can stop recursing
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { isChecked };
}
