import { TextDocument } from 'vscode';

export function typedFunctionCallLine(
  document: TextDocument,
  selectionLine: number,
): number {
  let currentLineText: string = document.lineAt(selectionLine).text;

  let totalOpenedParentheses = (currentLineText.match(/\(/g) || []).length;
  let totalClosedParentheses = (currentLineText.match(/\)/g) || []).length;

  // If the parentheses are already balanced, return the next line
  if (
    totalOpenedParentheses > 0 &&
    totalOpenedParentheses === totalClosedParentheses
  ) {
    return selectionLine + 1;
  }

  let currentLineNum = selectionLine + 1;

  while (currentLineNum < document.lineCount) {
    currentLineText = document.lineAt(currentLineNum).text;

    totalOpenedParentheses += (currentLineText.match(/\(/g) || []).length;
    totalClosedParentheses += (currentLineText.match(/\)/g) || []).length;

    if (currentLineNum === document.lineCount) {
      break;
    }

    currentLineNum++;

    // 🚀 Stop scanning when parentheses balance out
    if (
      totalOpenedParentheses > 0 &&
      totalOpenedParentheses === totalClosedParentheses
    ) {
      break;
    }
  }

  return totalOpenedParentheses > 0 &&
    totalOpenedParentheses === totalClosedParentheses
    ? currentLineNum
    : selectionLine + 1;
}
