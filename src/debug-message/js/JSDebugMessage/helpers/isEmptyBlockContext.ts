import { TextDocument } from 'vscode';
import {
  LogMessage,
  LogMessageType,
  LogContextMetadata,
} from '../../../../entities';
import { NamedFunctionMetadata } from '../../../../entities/extension/logMessage';

export function isEmptyBlockContext(
  document: TextDocument,
  logMessage: LogMessage,
): boolean {
  if (logMessage.logMessageType === LogMessageType.MultilineParenthesis) {
    return /\){.*}/.test(
      document
        .lineAt((logMessage.metadata as LogContextMetadata).closingContextLine)
        .text.replace(/\s/g, ''),
    );
  }
  if (logMessage.logMessageType === LogMessageType.NamedFunction) {
    return /\){.*}/.test(
      document
        .lineAt((logMessage.metadata as NamedFunctionMetadata).line)
        .text.replace(/\s/g, ''),
    );
  }
  return false;
}
