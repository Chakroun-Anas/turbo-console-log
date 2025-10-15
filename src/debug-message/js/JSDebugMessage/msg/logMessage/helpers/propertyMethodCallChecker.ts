import { TextDocument, Position } from 'vscode';
import {
  type AcornNode,
  isCallExpression,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

/**
 * Helper function to get the text of a node from source code
 */
function getNodeText(node: AcornNode, sourceCode: string): string {
  if (node.start !== undefined && node.end !== undefined) {
    return sourceCode.substring(node.start, node.end);
  }
  return '';
}

export function propertyMethodCallChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
) {
  // Locate the selection in the source
  const lineText = document.lineAt(selectionLine).text;
  const charIndex = lineText.indexOf(selectedText);
  if (charIndex === -1) return { isChecked: false };

  const startOffset = document.offsetAt(new Position(selectionLine, charIndex));
  const endOffset = startOffset + selectedText.length;

  const sourceCode = document.getText();

  if (!ast) {
    return { isChecked: false };
  }

  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Looking for: someObject.someMethod()
    // Where the selectedText is "someObject"
    if (isCallExpression(node)) {
      const callee = (node as { callee?: AcornNode }).callee;

      // The callee should be a MemberExpression (e.g., obj.method)
      if (callee && isMemberExpression(callee)) {
        const objectExpr = (callee as { object?: AcornNode }).object;

        if (objectExpr) {
          const objectText = getNodeText(objectExpr, sourceCode);

          // Check if the object matches the selected text and is within the selection range
          if (
            objectText === selectedText &&
            objectExpr.start !== undefined &&
            objectExpr.end !== undefined &&
            objectExpr.start <= startOffset &&
            objectExpr.end >= endOffset
          ) {
            isChecked = true;
            return true; // Found our match, stop recursing
          }
        }
      }
    }
  });

  return { isChecked };
}
