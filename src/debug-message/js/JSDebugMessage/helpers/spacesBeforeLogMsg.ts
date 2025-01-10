import { TextDocument } from 'vscode';

export function spacesBeforeLogMsg(
  document: TextDocument,
  selectedVarLine: number,
  logMsgLine: number,
): string {
  const selectedVarTextLine = document.lineAt(selectedVarLine);
  const selectedVarTextLineFirstNonWhitespaceCharacterIndex =
    selectedVarTextLine.firstNonWhitespaceCharacterIndex;
  const spacesBeforeSelectedVarLine = selectedVarTextLine.text
    .split('')
    .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
    .reduce((previousValue, currentValue) => previousValue + currentValue, '');
  if (logMsgLine < document.lineCount) {
    const logMsgTextLine = document.lineAt(logMsgLine);
    const logMsgTextLineFirstNonWhitespaceCharacterIndex =
      logMsgTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeLogMsgLine = logMsgTextLine.text
      .split('')
      .splice(0, logMsgTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    return spacesBeforeSelectedVarLine.length > spacesBeforeLogMsgLine.length
      ? spacesBeforeSelectedVarLine
      : spacesBeforeLogMsgLine;
  }
  return spacesBeforeSelectedVarLine;
}
