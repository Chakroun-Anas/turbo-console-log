import type { TurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';

/**
 * Determines the number of spaces/indentation before a log message should be inserted.
 * Compares indentation of selected variable line and log message line, using the greater.
 */

/**
 * Helper function to get the first non-whitespace character index
 */
function getFirstNonWhitespaceCharacterIndex(text: string): number {
  const match = text.match(/\S/);
  return match ? match.index! : text.length;
}

/**
 * Calculate the indentation level for the log message based on the context.
 * Takes the larger indentation between the selected variable line and log message line.
 *
 * @param document The text document
 * @param selectedVarLine The line number of the selected variable
 * @param logMsgLine The line number where the log will be inserted
 * @returns The indentation string (spaces or tabs)
 */
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
