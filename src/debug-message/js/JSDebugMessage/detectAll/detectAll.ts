import { TextDocument } from 'vscode';
import { Message, BracketType } from '../../../../entities';
import { closingContextLine } from '../../../../utilities';
import { spacesBeforeLogMsg } from '../helpers';

export function detectAll(
  document: TextDocument,
  logFunction: string,
  logMessagePrefix: string,
  delimiterInsideMessage: string,
): Message[] {
  const documentNbrOfLines: number = document.lineCount;
  const logMessages: Message[] = [];
  for (let i = 0; i < documentNbrOfLines; i++) {
    const turboConsoleLogMessage = new RegExp(
      logFunction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
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
