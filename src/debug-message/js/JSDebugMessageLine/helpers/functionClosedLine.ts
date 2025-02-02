import { TextDocument } from 'vscode';
import { BracketType } from '../../../../entities';
import { locOpenedClosedElementOccurrences } from './locOpenedClosedElementOccurrences';

/**
 * Log line of a variable in multiline context (function parameter, or deconstructed object, etc.)
 */
export function functionClosedLine(
  document: TextDocument,
  declarationLine: number,
  bracketType: BracketType,
): number {
  let nbrOfOpenedBraces = 0;
  let nbrOfClosedBraces = 0;
  while (declarationLine < document.lineCount) {
    const { openedElementOccurrences, closedElementOccurrences } =
      locOpenedClosedElementOccurrences(
        document.lineAt(declarationLine).text,
        bracketType,
      );
    nbrOfOpenedBraces += openedElementOccurrences;
    nbrOfClosedBraces += closedElementOccurrences;
    if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
      return declarationLine;
    }
    declarationLine++;
  }
  return -1;
}
