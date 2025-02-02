import { BracketType } from '../../../../entities';

export function locOpenedClosedElementOccurrences(
  loc: string,
  bracketType: BracketType,
): { openedElementOccurrences: number; closedElementOccurrences: number } {
  let openedElementOccurrences = 0;
  let closedElementOccurrences = 0;
  const openedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
  const closedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
  while (openedElement.exec(loc)) {
    openedElementOccurrences++;
  }
  while (closedElement.exec(loc)) {
    closedElementOccurrences++;
  }
  return {
    openedElementOccurrences,
    closedElementOccurrences,
  };
}
