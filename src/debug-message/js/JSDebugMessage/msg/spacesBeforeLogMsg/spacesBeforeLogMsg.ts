import type { TurboTextDocument } from '../../detectAll/TurboTextDocument';

/**
 * Gets the index of the first non-whitespace character in a string.
 * Returns the string length if the line is all whitespace.
 */
function getFirstNonWhitespaceCharacterIndex(text: string): number {
  const match = text.match(/\S/);
  return match ? match.index! : text.length;
}

// FIXME: Should be improved
export function spacesBeforeLogMsg(
  document: TurboTextDocument,
  selectedVarLine: number,
  logMsgLine: number,
): string {
  const selectedVarTextLine = document.lineAt(selectedVarLine);
  const selectedVarTextLineFirstNonWhitespaceCharacterIndex =
    getFirstNonWhitespaceCharacterIndex(selectedVarTextLine.text);
  const spacesBeforeSelectedVarLine = selectedVarTextLine.text
    .split('')
    .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
    .reduce((previousValue, currentValue) => previousValue + currentValue, '');
  if (logMsgLine < document.lineCount) {
    const logMsgTextLine = document.lineAt(logMsgLine);
    const logMsgTextLineFirstNonWhitespaceCharacterIndex =
      getFirstNonWhitespaceCharacterIndex(logMsgTextLine.text);
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
