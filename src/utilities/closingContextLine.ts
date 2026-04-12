import type { TurboTextDocument } from '../debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import { BracketType } from '../entities';
import { locBrackets } from './locBrackets';

export function closingContextLine(
  document: TurboTextDocument,
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
