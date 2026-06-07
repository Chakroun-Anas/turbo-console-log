import type { TextDocument } from 'vscode';
import type { ExtensionProperties } from '@/entities';
import type { PythonProgram } from '../python-parser-utils/types';
import {
  addPrefix,
  addFileInfo,
  addEnclosingContext,
  addVariable,
  getFileName,
  getEnclosingContext,
  buildLogMessage,
} from './helpers';

export function constructDebuggingMsgContent(
  program: PythonProgram,
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
  const actualLineNum =
    lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1);

  const { className, functionName } = getEnclosingContext(
    program,
    document,
    lineOfSelectedVar,
    insertEnclosingClass,
    insertEnclosingFunction,
  );

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
  parts.push(...addEnclosingContext(className, functionName, delimiterInsideMessage));
  parts.push(...addVariable(selectedVar, logMessageSuffix));

  return buildLogMessage(parts, logFunction, quote, selectedVar);
}
