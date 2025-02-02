import { TextDocument } from 'vscode';
import { closingElementLine } from './closingElementLine';
import { BracketType } from '../../../../entities';

export function functionAssignmentLine(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  const currentLineText = document.lineAt(selectionLine).text.trim();

  // Check if it's an object property function (e.g., `actions: function() {`)
  const isObjectPropertyFunction =
    /^\s*[a-zA-Z_$][\w$]*\s*:\s*function\s*\(/.test(currentLineText);

  if (isObjectPropertyFunction) {
    return selectionLine + 1; // 🔥 Simplified! Just place the log on the next line.
  }

  if (/{/.test(currentLineText)) {
    if (
      document.lineAt(selectionLine).text.split('=')[1]?.includes(selectedVar)
    ) {
      return selectionLine + 1;
    }
    return (
      closingElementLine(document, selectionLine, BracketType.CURLY_BRACES) + 1
    );
  } else {
    const closedParenthesisLine = closingElementLine(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
    );
    return (
      closingElementLine(
        document,
        closedParenthesisLine,
        BracketType.CURLY_BRACES,
      ) + 1
    );
  }
}
