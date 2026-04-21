/**
 * Inserts the debug message into the document at the calculated position.
 */

import type { TextDocument, TextEditorEdit } from 'vscode';
import { ExtensionProperties } from '@/entities';

/**
 * Insert the constructed debug message into the document.
 *
 * @param document The text document
 * @param textEditor The VS Code text editor edit instance
 * @param lineOfLogMsg The line number where to insert the log
 * @param debuggingMsg The complete debug message to insert
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
  vscode: typeof import('vscode'),
): void {
  textEditor.insert(
    new vscode.Position(
      lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg,
      0,
    ),
    `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
      lineOfLogMsg === document.lineCount ? '\n' : ''
    }${debuggingMsg}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
  );
}
