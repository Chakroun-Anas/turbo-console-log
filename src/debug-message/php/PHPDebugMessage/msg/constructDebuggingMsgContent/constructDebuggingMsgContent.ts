/**
 * Constructs the debugging message content using helper functions.
 * Mirrors the JS/TS implementation structure for consistency.
 */

import type { TextDocument } from 'vscode';
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
import type { Program } from '../php-parser-utils';

/**
 * Constructs the debugging message content using helper functions.
 * @param ast The pre-parsed PHP AST (to avoid re-parsing)
 * @param document The text document
 * @param selectedVar The selected variable name
 * @param lineOfSelectedVar The line number of the selected variable
 * @param lineOfLogMsg The line number where the log message will be inserted
 * @param extensionProperties Configuration properties for the extension
 * @param logFunction The PHP logging function to use (var_dump, error_log, print_r)
 * @returns The constructed debugging message content
 */
export function constructDebuggingMsgContent(
  ast: Program,
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

  // Ensure variable has $ prefix
  const cleanVar = selectedVar.startsWith('$')
    ? selectedVar
    : `$${selectedVar}`;

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

  parts.push(...addVariable(cleanVar, logMessageSuffix));

  // Build final message
  const result = buildLogMessage(parts, logFunction, quote, cleanVar);

  return result;
}
