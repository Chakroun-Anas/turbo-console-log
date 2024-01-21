import { TextDocument } from 'vscode';
import { BracketType, MultilineContextVariable } from '../entities';
import { locBrackets } from './locBrackets';
import { closingContextLine } from './closingContextLine';

export function getMultiLineContextVariable(
  document: TextDocument,
  lineNum: number,
  bracketType: BracketType,
  innerScope = true,
): MultilineContextVariable | null {
  const { openingBrackets, closingBrackets } = locBrackets(
    document.lineAt(lineNum).text,
    bracketType,
  );
  if (
    innerScope &&
    openingBrackets !== 0 &&
    openingBrackets === closingBrackets
  ) {
    return null;
  }
  let currentLineNum = lineNum - 1;
  let nbrOfOpenedBlockType = 0;
  let nbrOfClosedBlockType = 1; // Closing parenthesis
  while (currentLineNum >= 0) {
    const currentLineText: string = document.lineAt(currentLineNum).text;
    const currentLineParenthesis = locBrackets(currentLineText, bracketType);
    nbrOfOpenedBlockType += currentLineParenthesis.openingBrackets;
    nbrOfClosedBlockType += currentLineParenthesis.closingBrackets;
    if (nbrOfOpenedBlockType === nbrOfClosedBlockType) {
      return {
        openingContextLine: currentLineNum,
        closingContextLine: closingContextLine(
          document,
          currentLineNum,
          bracketType,
        ),
      };
    }
    currentLineNum--;
  }
  if (bracketType === BracketType.PARENTHESIS && openingBrackets > 0) {
    return {
      openingContextLine: lineNum,
      closingContextLine: closingContextLine(document, lineNum, bracketType),
    };
  }
  return null;
}
