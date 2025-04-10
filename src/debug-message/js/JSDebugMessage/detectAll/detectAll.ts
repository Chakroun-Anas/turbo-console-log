import { TextDocument } from 'vscode';
import {
  Message,
  BracketType,
  ExtensionProperties,
} from '../../../../entities';
import { closingContextLine } from '../../../../utilities';
import { spacesBeforeLogMsg } from '../helpers';

function logFunctionToUse(
  logFunction: ExtensionProperties['logFunction'],
  logType: ExtensionProperties['logType'],
  args?: unknown[],
): string {
  if (
    args &&
    args.length > 0 &&
    typeof args[0] === 'object' &&
    args[0] !== null
  ) {
    const firstArg = args[0] as Record<string, unknown>;
    if ('logFunction' in firstArg && typeof firstArg.logFunction === 'string') {
      return firstArg.logFunction;
    }
    if ('logType' in firstArg && typeof firstArg.logType === 'string') {
      return firstArg.logType;
    }
    return logFunction;
  }
  if (logFunction === 'log' && logType !== 'log') {
    return logType;
  }
  return logFunction;
}

export function detectAll(
  document: TextDocument,
  logFunction: ExtensionProperties['logFunction'],
  logType: ExtensionProperties['logType'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  args?: unknown[],
): Message[] {
  const logFunctionToUseResult: string = logFunctionToUse(
    logFunction,
    logType,
    args,
  );
  const documentNbrOfLines: number = document.lineCount;
  const logMessages: Message[] = [];
  for (let i = 0; i < documentNbrOfLines; i++) {
    const turboConsoleLogMessage = new RegExp(
      logFunctionToUseResult.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
      const logMessage: Message = {
        spaces: '',
        lines: [],
      };
      logMessage.spaces = spacesBeforeLogMsg(document, i, i);
      const closedParenthesisLine = closingContextLine(
        document,
        i,
        BracketType.PARENTHESIS,
      );
      let msg = '';
      for (let j = i; j <= closedParenthesisLine; j++) {
        msg += document.lineAt(j).text;
        logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
      }
      if (
        new RegExp(logMessagePrefix).test(msg) ||
        new RegExp(delimiterInsideMessage).test(msg)
      ) {
        logMessages.push(logMessage);
      }
    }
  }
  return logMessages;
}
