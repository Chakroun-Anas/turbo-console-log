import { TextDocument } from 'vscode';
import {
  LogMessage,
  LogMessageType,
  LogContextMetadata,
} from '../../../../entities';
import { NamedFunctionMetadata } from '../../../../entities/extension/logMessage';
import { EMPTY_BLOCK_REGEX } from './regexContants';

export function isEmptyBlockContext(
  document: TextDocument,
  logMessage: LogMessage,
): boolean {
  switch (logMessage.logMessageType) {
    case LogMessageType.MultilineParenthesis:
      return /\){.*}/.test(
        document
          .lineAt(
            (logMessage.metadata as LogContextMetadata).closingContextLine,
          )
          .text.replace(/\s/g, ''),
      );
    case LogMessageType.NamedFunction:
    case LogMessageType.NamedFunctionAssignment:
      return EMPTY_BLOCK_REGEX.test(
        document
          .lineAt((logMessage.metadata as NamedFunctionMetadata).line)
          .text.replace(/\s/g, ''),
      );
    default:
      return false;
  }
}
