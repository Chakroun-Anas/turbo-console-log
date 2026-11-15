import type { TurboTextDocument } from '../../detectAll/TurboTextDocument';
import { leadingWhitespace } from '@/utilities/indentation';
import { anchorLine, blockOpenedByLog, blockOpeningIndent } from './helpers';
import type { LogInsertion } from './types';

/**
 * The indentation of a log line. `insertion` is given when a new log is
 * inserted, and left out to read the indent of a log already in the file.
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

  const anchor = insertion
    ? anchorLine(insertion.ast, selectedVarLine)
    : selectedVarLine;
  const anchorIndent = leadingWhitespace(document.lineAt(anchor).text);
  if (logMsgLine >= document.lineCount) return anchorIndent;

  const logLineIndent = leadingWhitespace(document.lineAt(logMsgLine).text);
  return anchorIndent.length > logLineIndent.length
    ? anchorIndent
    : logLineIndent;
}
