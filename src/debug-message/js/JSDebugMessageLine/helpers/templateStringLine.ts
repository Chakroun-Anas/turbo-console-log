import { TextDocument } from 'vscode';

export function templateStringLine(
  document: TextDocument,
  selectionLine: number,
): number {
  const currentLineText: string = document.lineAt(selectionLine).text;
  let currentLineNum: number = selectionLine + 1;
  let nbrOfBackticks: number = (currentLineText.match(/`/g) || []).length;
  while (currentLineNum < document.lineCount) {
    const currentLineText: string = document.lineAt(currentLineNum).text;
    nbrOfBackticks += (currentLineText.match(/`/g) || []).length;
    if (nbrOfBackticks % 2 === 0) {
      break;
    }
    currentLineNum++;
  }
  return nbrOfBackticks % 2 === 0 ? currentLineNum + 1 : selectionLine + 1;
}
