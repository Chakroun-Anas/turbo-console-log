import { TextDocument } from 'vscode';
import { closingElementLine } from './closingElementLine';
import { BracketType } from '../../../../entities';

export function functionAssignmentLine(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  const currentLineText = document.lineAt(selectionLine).text;
  if (/{/.test(currentLineText)) {
    if (
      document.lineAt(selectionLine).text.split('=')[1].includes(selectedVar)
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
