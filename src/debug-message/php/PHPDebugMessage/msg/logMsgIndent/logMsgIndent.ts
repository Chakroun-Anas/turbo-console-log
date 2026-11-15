import type { TurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import { leadingWhitespace } from '@/utilities/indentation';
import {
  blockOpenedByLog,
  blockOpeningIndent,
  statementFirstLine,
} from './helpers';
import type { LogInsertion } from './types';

/**
 * The indentation of a log line. `insertion` is given when a new log is
 * inserted, and left out to read the indent of a log already in the file.
 *
 * @param document The text document
 * @param selectedVarLine The line number of the selected variable
 * @param logMsgLine The line number where the log will be inserted
 * @param insertion The parsed file and the editor tab size
 * @returns The indentation string (spaces or tabs)
 */
export function logMsgIndent(
  document: TurboTextDocument,
  selectedVarLine: number,
  logMsgLine: number,
  insertion?: LogInsertion,
): string {
  if (insertion) {
    const block = blockOpenedByLog(document, logMsgLine, insertion.ast);
    if (block) return blockOpeningIndent(document, block, insertion.tabSize);
  }

  const anchorLine = insertion
    ? (statementFirstLine(insertion.ast, selectedVarLine) ?? selectedVarLine)
    : selectedVarLine;
  const anchorIndent = leadingWhitespace(document.lineAt(anchorLine).text);
  if (logMsgLine >= document.lineCount) return anchorIndent;

  const logLineText = document.lineAt(logMsgLine).text;
  const logLineIndent = leadingWhitespace(logLineText);
  // A parameter used deep in the function logs at its top, above the selection
  if (insertion && logMsgLine <= anchorLine && logLineText.trim() !== '') {
    return logLineIndent;
  }
  return anchorIndent.length > logLineIndent.length
    ? anchorIndent
    : logLineIndent;
}
