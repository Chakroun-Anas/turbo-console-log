import { TextEditorEdit, TextDocument, window } from 'vscode';
import {
  ExtensionProperties,
  LogMessage,
  LogContextMetadata,
} from '@/entities';
import { logMessage } from './logMessage';
import { spacesBeforeLogMsg } from './spacesBeforeLogMsg';
import { line as logMessageLine } from './logMessageLine';
import {
  applyTransformedCode,
  needTransformation,
  performTransformation,
} from './transformer';
import { omit } from './helpers/omit';
import { constructDebuggingMsg } from './constructDebuggingMsg';
import { constructDebuggingMsgContent } from './constructDebuggingMsgContent';
import { insertDebugMessage } from './insertDebugMessage';
import { parseCode } from './acorn-utils';

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
  logFunction: string,
): void {
  // Parse the code once and reuse the AST throughout the process
  const code = document.getText();

  // Get file extension from document URI
  const filePath = document.uri?.path || document.fileName || '';
  const fileExtension = filePath.split('.').pop();
  const extension = fileExtension ? `.${fileExtension}` : undefined;

  let ast;

  try {
    ast = parseCode(code, extension, lineOfSelectedVar);
  } catch (error) {
    // Show error notification to the user
    window.showErrorMessage(
      `Turbo AST: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return;
  }

  const logMsg: LogMessage = logMessage(
    ast,
    document,
    lineOfSelectedVar,
    selectedVar,
  );

  const lineOfLogMsg: number = logMessageLine(
    ast,
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
    ast,
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
    logFunction,
  );
  const debuggingMsg: string = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
    logFunction,
  );

  // Handle code transformation if needed
  if (needTransformation(ast, document, lineOfSelectedVar, selectedVar)) {
    const transformedCode = performTransformation(
      ast,
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
