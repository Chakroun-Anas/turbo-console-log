import { TextDocument } from 'vscode';
import { BracketType } from '../../../../entities';
import { locOpenedClosedElementOccurrences } from './locOpenedClosedElementOccurrences';

export function functionCallLine(
  document: TextDocument,
  selectionLine: number,
): number {
  let currentLineText: string = document.lineAt(selectionLine).text;

  // Track if we're inside a Styled Component template literal
  const insideTemplateLiteral =
    currentLineText.includes('`') && !currentLineText.includes('`;');

  let totalOpenedBrackets = 0;
  let totalClosedBrackets = 0;
  let totalOpenedParentheses = 0;
  let totalClosedParentheses = 0;
  let totalOpenedBackticks = insideTemplateLiteral ? 1 : 0;

  const curlyBracesOcurrences = locOpenedClosedElementOccurrences(
    currentLineText,
    BracketType.CURLY_BRACES,
  );

  totalOpenedBrackets += curlyBracesOcurrences.openedElementOccurrences;
  totalClosedBrackets += curlyBracesOcurrences.closedElementOccurrences;

  const parenthesisOcurrences = locOpenedClosedElementOccurrences(
    currentLineText,
    BracketType.PARENTHESIS,
  );

  totalOpenedParentheses += parenthesisOcurrences.openedElementOccurrences;
  totalClosedParentheses += parenthesisOcurrences.closedElementOccurrences;

  if (
    totalOpenedBackticks === totalClosedBrackets &&
    totalClosedParentheses === totalOpenedParentheses
  ) {
    return selectionLine + 1;
  }

  let currentLineNum = selectionLine + 1;

  while (currentLineNum < document.lineCount) {
    currentLineText = document.lineAt(currentLineNum).text;

    // 🚀 Improved: Count ALL occurrences of '{', '}', '(', and ')'
    totalOpenedBrackets += (currentLineText.match(/{/g) || []).length;
    totalClosedBrackets += (currentLineText.match(/}/g) || []).length;
    totalOpenedParentheses += (currentLineText.match(/\(/g) || []).length;
    totalClosedParentheses += (currentLineText.match(/\)/g) || []).length;

    // Track template literals (Styled Component template strings)
    if (currentLineText.includes('`')) totalOpenedBackticks++;

    if (currentLineNum === document.lineCount - 1) {
      break;
    }

    currentLineNum++;

    // 🚀 Stop scanning when we close all brackets, parentheses, and backticks
    if (
      totalOpenedBrackets === totalClosedBrackets &&
      totalOpenedParentheses === totalClosedParentheses &&
      totalOpenedBackticks % 2 === 0
    ) {
      break;
    }
  }

  return totalOpenedBrackets === totalClosedBrackets &&
    totalOpenedParentheses === totalClosedParentheses &&
    totalOpenedBackticks % 2 === 0
    ? currentLineNum
    : selectionLine + 1;
}
