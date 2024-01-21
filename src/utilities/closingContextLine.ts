import { TextDocument } from 'vscode';
import { BracketType } from '../entities';
import { locBrackets } from './locBrackets';

export function closingContextLine(
  document: TextDocument,
  declarationLine: number,
  bracketType: BracketType,
): number {
  let nbrOfOpenedBraces = 0;
  let nbrOfClosedBraces = 0;
  while (declarationLine < document.lineCount) {
    const { openingBrackets, closingBrackets } = locBrackets(
      document.lineAt(declarationLine).text,
      bracketType,
    );
    nbrOfOpenedBraces += openingBrackets;
    nbrOfClosedBraces += closingBrackets;
    if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
      return declarationLine;
    }
    declarationLine++;
  }
  return -1;
}
