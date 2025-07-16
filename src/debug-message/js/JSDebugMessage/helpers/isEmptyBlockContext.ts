import { TextDocument } from 'vscode';
import { LogMessage, LogMessageType } from '@/entities';
import { EMPTY_BLOCK_REGEX } from './regexContants';

export function isEmptyBlockContext(
  document: TextDocument,
  logMessage: LogMessage,
  lineOfLogMsg: number,
): boolean {
  switch (logMessage.logMessageType) {
    case LogMessageType.FunctionParameter:
      return /\){.*}/.test(
        document.lineAt(lineOfLogMsg - 1).text.replace(/\s/g, ''),
      );
    case LogMessageType.NamedFunctionAssignment:
      return EMPTY_BLOCK_REGEX.test(
        document.lineAt(lineOfLogMsg - 1).text.replace(/\s/g, ''),
      );
    default:
      return false;
  }
}
