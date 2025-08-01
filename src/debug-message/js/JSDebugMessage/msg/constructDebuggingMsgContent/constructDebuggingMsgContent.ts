/**
 * Constructs the debugging message content using helper functions.
 */

import { TextDocument } from 'vscode';
import { ExtensionProperties } from '@/entities';
import {
  addPrefix,
  addFileInfo,
  addEnclosingContext,
  addVariable,
  buildLogMessage,
  getFileName,
  getEnclosingContext,
} from './helpers';

/**
 * Constructs the debugging message content using helper functions.
 * @param document The text document
 * @param selectedVar The selected variable name
 * @param lineOfSelectedVar The line number of the selected variable
 * @param lineOfLogMsg The line number where the log message will be inserted
 * @param extensionProperties Configuration properties for the extension
 * @returns The constructed debugging message content
 */
export function constructDebuggingMsgContent(
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  lineOfLogMsg: number,
  extensionProperties: Omit<
    ExtensionProperties,
    'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'
  >,
  logFunction: string,
): string {
  const {
    includeFilename,
    includeLineNum,
    logMessagePrefix,
    logMessageSuffix,
    delimiterInsideMessage,
    insertEmptyLineBeforeLogMessage,
    quote,
    insertEnclosingClass,
    insertEnclosingFunction,
  } = extensionProperties;

  const fileName = getFileName(document.fileName);
  const { className, functionName } = getEnclosingContext(
    document,
    lineOfSelectedVar,
    insertEnclosingClass,
    insertEnclosingFunction,
  );

  const actualLineNum =
    lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1);

  // Build message parts using helper functions
  const parts: string[] = [];

  // Add prefix
  parts.push(...addPrefix(logMessagePrefix, delimiterInsideMessage));

  // Add file info
  parts.push(
    ...addFileInfo(
      fileName,
      actualLineNum,
      includeFilename,
      includeLineNum,
      delimiterInsideMessage,
    ),
  );

  // Add enclosing context
  parts.push(
    ...addEnclosingContext(className, functionName, delimiterInsideMessage),
  );

  // Add variable
  parts.push(...addVariable(selectedVar, logMessageSuffix));

  // Build final message
  return buildLogMessage(
    parts,
    logFunction,
    quote,
    selectedVar,
    extensionProperties.addSemicolonInTheEnd,
  );
}
