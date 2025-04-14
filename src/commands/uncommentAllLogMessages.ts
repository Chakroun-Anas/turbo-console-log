import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: async (
      {
        delimiterInsideMessage,
        logMessagePrefix,
        logType,
        logFunction,
      }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
      args?: unknown[],
    ) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunction,
        logType,
        logMessagePrefix,
        delimiterInsideMessage,
        args,
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replace(/\//g, '').trim()}\n`,
            );
          });
        });
      });
    },
  };
}
