import { Position, TextDocument } from 'vscode';
import {
  type AcornNode,
  isCallExpression,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

export function propertyMethodCallLine(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedText: string,
): number {
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
  const code = document.getText();

  walk(ast, (node: AcornNode): boolean | void => {
    // look for a call expression whose object matches our selectedText
    if (isCallExpression(node)) {
      const callee = (node as { callee?: AcornNode }).callee;
      if (callee && isMemberExpression(callee)) {
        const object = (callee as { object: AcornNode }).object;

        // Get the text of the object expression
        if (object.start !== undefined && object.end !== undefined) {
          const objectText = code.substring(object.start, object.end);

          if (
            objectText === selectedText &&
            object.start <= startOffset &&
            object.end >= endOffset
          ) {
            // place insertion right after the call ends
            if (node.end !== undefined) {
              const pos = document.positionAt(node.end);
              insertionLine = pos.line + 1;
              return true; // Stop walking
            }
          }
        }
      }
    }
  });

  return insertionLine;
}
