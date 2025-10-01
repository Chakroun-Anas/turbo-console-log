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
import type { AcornNode } from '../acorn-utils';

/**
 * Constructs the debugging message content using helper functions.
 * @param ast The pre-parsed AST (to avoid re-parsing)
 * @param document The text document
 * @param selectedVar The selected variable name
 * @param lineOfSelectedVar The line number of the selected variable
 * @param lineOfLogMsg The line number where the log message will be inserted
 * @param extensionProperties Configuration properties for the extension
 * @returns The constructed debugging message content
 */
export function constructDebuggingMsgContent(
  ast: AcornNode,
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
    ast,
    document,
    lineOfSelectedVar,
    insertEnclosingClass,
    insertEnclosingFunction,
  );

  const actualLineNum =
    lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1);

  // Build message parts using helper functions
  const parts: string[] = [];

  parts.push(...addPrefix(logMessagePrefix, delimiterInsideMessage));

  parts.push(
    ...addFileInfo(
      fileName,
      actualLineNum,
      includeFilename,
      includeLineNum,
      delimiterInsideMessage,
    ),
  );
  parts.push(
    ...addEnclosingContext(className, functionName, delimiterInsideMessage),
  );
  parts.push(...addVariable(selectedVar, logMessageSuffix));

  // Build final message
  const result = buildLogMessage(
    parts,
    logFunction,
    quote,
    selectedVar,
    extensionProperties.addSemicolonInTheEnd,
  );
  return result;
}
