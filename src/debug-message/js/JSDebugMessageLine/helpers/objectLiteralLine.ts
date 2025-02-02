import { TextDocument } from 'vscode';

export function objectLiteralLine(
  document: TextDocument,
  selectionLine: number,
): number {
  const currentLineText: string = document.lineAt(selectionLine).text;
  let nbrOfOpenedBrackets: number = (currentLineText.match(/{/g) || []).length;
  let nbrOfClosedBrackets: number = (currentLineText.match(/}/g) || []).length;
  let currentLineNum: number = selectionLine + 1;
  while (currentLineNum < document.lineCount) {
    const currentLineText: string = document.lineAt(currentLineNum).text;
    nbrOfOpenedBrackets += (currentLineText.match(/{/g) || []).length;
    nbrOfClosedBrackets += (currentLineText.match(/}/g) || []).length;
    currentLineNum++;
    if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
      break;
    }
  }
  return nbrOfClosedBrackets === nbrOfOpenedBrackets
    ? currentLineNum
    : selectionLine + 1;
}
