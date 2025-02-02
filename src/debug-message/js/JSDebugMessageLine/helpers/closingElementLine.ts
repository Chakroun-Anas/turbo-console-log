import { TextDocument } from 'vscode';
import { BracketType } from '../../../../entities';
import { locOpenedClosedElementOccurrences } from './locOpenedClosedElementOccurrences';

export function closingElementLine(
  document: TextDocument,
  lineNum: number,
  bracketType: BracketType,
): number {
  const docNbrOfLines: number = document.lineCount;
  let closingElementFound = false;
  let openedElementOccurrences = 0;
  let closedElementOccurrences = 0;
  while (!closingElementFound && lineNum < docNbrOfLines - 1) {
    const currentLineText: string = document.lineAt(lineNum).text;
    const openedClosedElementOccurrences = locOpenedClosedElementOccurrences(
      currentLineText,
      bracketType,
    );
    openedElementOccurrences +=
      openedClosedElementOccurrences.openedElementOccurrences;
    closedElementOccurrences +=
      openedClosedElementOccurrences.closedElementOccurrences;
    if (openedElementOccurrences === closedElementOccurrences) {
      closingElementFound = true;
      return lineNum;
    }
    lineNum++;
  }
  return lineNum;
}
