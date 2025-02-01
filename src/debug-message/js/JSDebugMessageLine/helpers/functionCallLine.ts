import { TextDocument } from 'vscode';
import { BracketType } from '../../../../entities';
import { locOpenedClosedElementOccurrences } from './locOpenedClosedElementOccurrences';

export function functionCallLine(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): number {
  let currentLineText: string = document.lineAt(selectionLine).text;
  let nextLineText: string = document
    .lineAt(selectionLine + 1)
    .text.replace(/\s/g, '');
  if (
    /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
    /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
  ) {
    return selectionLine + 1;
  }
  let totalOpenedParenthesis = 0;
  let totalClosedParenthesis = 0;
  const { openedElementOccurrences, closedElementOccurrences } =
    locOpenedClosedElementOccurrences(currentLineText, BracketType.PARENTHESIS);
  totalOpenedParenthesis += openedElementOccurrences;
  totalClosedParenthesis += closedElementOccurrences;
  let currentLineNum = selectionLine + 1;
  if (
    totalOpenedParenthesis !== totalClosedParenthesis ||
    currentLineText.endsWith('.') ||
    nextLineText.trim().startsWith('.')
  ) {
    while (currentLineNum < document.lineCount) {
      currentLineText = document.lineAt(currentLineNum).text;
      const { openedElementOccurrences, closedElementOccurrences } =
        locOpenedClosedElementOccurrences(
          currentLineText,
          BracketType.PARENTHESIS,
        );
      totalOpenedParenthesis += openedElementOccurrences;
      totalClosedParenthesis += closedElementOccurrences;
      if (currentLineNum === document.lineCount - 1) {
        break;
      }
      nextLineText = document.lineAt(currentLineNum + 1).text;
      currentLineNum++;
      if (
        totalOpenedParenthesis === totalClosedParenthesis &&
        !currentLineText.endsWith('.') &&
        !nextLineText.trim().startsWith('.')
      ) {
        break;
      }
    }
  }
  return totalOpenedParenthesis === totalClosedParenthesis
    ? currentLineNum
    : selectionLine + 1;
}
