import { TextDocument } from 'vscode';

export function spacesBeforeLine(
  document: TextDocument,
  lineNumber: number,
): string {
  const textLine = document.lineAt(lineNumber);
  const lineFirstNonWhitespaceCharacterIndex =
    textLine.firstNonWhitespaceCharacterIndex;
  return textLine.text
    .split('')
    .splice(0, lineFirstNonWhitespaceCharacterIndex)
    .reduce((previousValue, currentValue) => previousValue + currentValue, '');
}
