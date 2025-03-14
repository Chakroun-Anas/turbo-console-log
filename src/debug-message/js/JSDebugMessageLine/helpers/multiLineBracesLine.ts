import { BracketType } from '../../../../entities';
import { locBrackets } from '../../../../utilities';

export function multilineBracesLine(
  selectedVar: string,
  selectionLine: number,
  closingContextLine?: number,
): number {
  const currentLineParenthesis = locBrackets(
    selectedVar,
    BracketType.PARENTHESIS,
  );
  const currentLineCurlyBraces = locBrackets(
    selectedVar,
    BracketType.CURLY_BRACES,
  );

  // Determine if it's a complete statement:
  const isCompleteStatement =
    currentLineParenthesis.openingBrackets > 0 &&
    currentLineParenthesis.openingBrackets ===
      currentLineParenthesis.closingBrackets &&
    currentLineCurlyBraces.openingBrackets ===
      currentLineCurlyBraces.closingBrackets;

  if (isCompleteStatement) {
    return selectionLine + 1;
  }

  return closingContextLine ? closingContextLine + 1 : selectionLine + 1;
}
