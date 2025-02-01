import { TextDocument } from 'vscode';

export function ternaryExpressionLine(
  document: TextDocument,
  selectionLine: number,
): number {
  let concatenatedLines = document.lineAt(selectionLine).text.trim();
  let lineIndex = selectionLine;
  const MAX_TERNARY_LOOKAHEAD = 5;
  for (let i = 1; i < MAX_TERNARY_LOOKAHEAD; i++) {
    if (lineIndex + 1 < document.lineCount) {
      lineIndex++;
      concatenatedLines += ' ' + document.lineAt(lineIndex).text.trim();
    }
    if (/[^\\?:]+\?.+:.+/.test(concatenatedLines)) {
      break;
    }
  }

  return lineIndex + 1;
}
