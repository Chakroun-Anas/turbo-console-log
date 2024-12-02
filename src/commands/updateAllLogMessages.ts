import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';
import type { JSDebugMessage } from '../debug-message/js';

export function updateAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.updateAllLogMessages',
    handler: async (
      {
        delimiterInsideMessage,
        logMessagePrefix,
        logFunction,
      }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
      args?: unknown[],
    ) => {
      function logFunctionToUse(): string {
        if (
          args &&
          args.length > 0 &&
          typeof args[0] === 'object' &&
          args[0] !== null
        ) {
          const firstArg = args[0] as Record<string, unknown>;
          if (
            'logFunction' in firstArg &&
            typeof firstArg.logFunction === 'string'
          ) {
            return firstArg.logFunction;
          }
          return logFunction;
        }
        return logFunction;
      }

      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunctionToUse(),
        logMessagePrefix,
        delimiterInsideMessage,
      );
      console.log(
        '🚀 ~ file: updateAllLogFMessages.ts:49 ~ updateAllLogMessagesCommand ~ logMessages:',
        logMessages,
      );

      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            const prevLine = document.getText(line).trim();
            const newLine = (
              jsDebugMessage as JSDebugMessage
            ).updateFileNameAndLineNum(prevLine, document, line.start.line + 1);
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${newLine}\n`,
            );
          });
        });
      });
    },
  };
}
