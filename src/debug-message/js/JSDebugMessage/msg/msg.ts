import { TextEditorEdit, TextDocument } from 'vscode';
import {
  ExtensionProperties,
  LogMessage,
  LogContextMetadata,
} from '@/entities';
import { logMessage } from '../logMessage';
import { spacesBeforeLogMsg } from '../helpers';
import { line as logMessageLine } from '../logMessageLine';
import {
  applyTransformedCode,
  needTransformation,
  performTransformation,
} from '../transformer';
import { omit } from './helpers/omit';
import { constructDebuggingMsg } from './constructDebuggingMsg';
import { constructDebuggingMsgContent } from './constructDebuggingMsgContent';
import { insertDebugMessage } from './insertDebugMessage';

/**
 * Main function to generate and insert debugging messages into the document.
 * This function orchestrates the entire process of creating a debug log message
 * based on the selected variable and extension configuration.
 *
 * @param textEditor The text editor instance for making edits
 * @param document The text document being edited
 * @param selectedVar The selected variable name to debug
 * @param lineOfSelectedVar The line number where the variable is located
 * @param tabSize The tab size setting for proper indentation
 * @param extensionProperties Configuration properties for the extension
 */
export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  tabSize: number,
  extensionProperties: ExtensionProperties,
): void {
  const logMsg: LogMessage = logMessage(
    document,
    lineOfSelectedVar,
    selectedVar,
  );
  const lineOfLogMsg: number = logMessageLine(
    document,
    lineOfSelectedVar,
    selectedVar,
    logMsg,
  );
  const spacesBeforeMsg: string = spacesBeforeLogMsg(
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      : lineOfSelectedVar,
    lineOfLogMsg,
  );
  const debuggingMsgContent: string = constructDebuggingMsgContent(
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      : selectedVar,
    lineOfSelectedVar,
    lineOfLogMsg,
    omit(extensionProperties, [
      'wrapLogMessage',
      'insertEmptyLineAfterLogMessage',
    ]),
  );
  const debuggingMsg: string = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
  );

  // Handle code transformation if needed
  if (needTransformation(document, lineOfSelectedVar, selectedVar)) {
    const transformedCode = performTransformation(
      document,
      lineOfSelectedVar,
      selectedVar,
      debuggingMsg,
      {
        addSemicolonInTheEnd: extensionProperties.addSemicolonInTheEnd,
        tabSize: tabSize,
      },
    );
    applyTransformedCode(document, transformedCode);
    return;
  }

  // Insert the debugging message into the document
  insertDebugMessage(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );
}
