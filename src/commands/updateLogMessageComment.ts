import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';
import type { JSDebugMessage } from '../debug-message/js';

export function updateLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.updateLogMessage',
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

      const selections = editor.selections;
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunctionToUse(),
        logMessagePrefix,
        delimiterInsideMessage,
      );

      const selectedLogMessages = logMessages.filter((msg) =>
        msg.lines.some((lineRange) => {
          return selections.some((sel) => lineRange.intersection(sel));
        }),
      );

      editor.edit((editBuilder) => {
        selectedLogMessages.forEach(({ spaces, lines }) => {
          lines.forEach((lineRange: vscode.Range) => {
            const prevLine = document.getText(lineRange).trim();
            const newLine = (
              jsDebugMessage as JSDebugMessage
            ).updateFileNameAndLineNum(
              prevLine,
              document,
              lineRange.start.line + 1,
            );
            editBuilder.delete(lineRange);
            editBuilder.insert(
              new vscode.Position(lineRange.start.line, 0),
              `${spaces}${newLine}\n`,
            );
          });
        });
      });
    },
  };
}
