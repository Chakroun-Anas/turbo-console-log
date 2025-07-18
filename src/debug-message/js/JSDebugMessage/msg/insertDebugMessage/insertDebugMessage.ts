/**
 * Inserts the debugging message into the document at the specified position.
 */

import { TextDocument, TextEditorEdit, Position } from 'vscode';
import { ExtensionProperties } from '@/entities';

/**
 * Inserts the debugging message into the document at the specified position.
 * @param document The text document
 * @param textEditor The text editor for making edits
 * @param lineOfLogMsg The line number where the log message should be inserted
 * @param debuggingMsg The debugging message to insert
 * @param insertEmptyLineBeforeLogMessage Whether to insert an empty line before the log message
 * @param insertEmptyLineAfterLogMessage Whether to insert an empty line after the log message
 */
export function insertDebugMessage(
  document: TextDocument,
  textEditor: TextEditorEdit,
  lineOfLogMsg: number,
  debuggingMsg: string,
  insertEmptyLineBeforeLogMessage: ExtensionProperties['insertEmptyLineBeforeLogMessage'],
  insertEmptyLineAfterLogMessage: ExtensionProperties['insertEmptyLineAfterLogMessage'],
): void {
  textEditor.insert(
    new Position(
      lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg,
      0,
    ),
    `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
      lineOfLogMsg === document.lineCount ? '\n' : ''
    }${debuggingMsg}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
  );
}
