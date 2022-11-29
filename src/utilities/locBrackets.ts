import { BracketType, LogBracket } from '../entities';

export function locBrackets(loc: string, bracketType: BracketType): LogBracket {
  let openingBrackets = 0;
  let closingBrackets = 0;
  const openedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
  const closedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
  while (openedElement.exec(loc)) {
    openingBrackets++;
  }
  while (closedElement.exec(loc)) {
    closingBrackets++;
  }
  return {
    openingBrackets,
    closingBrackets,
  };
}
