import * as vscode from 'vscode';
import { Command, Message } from '../entities';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: async ({ extensionProperties, debugMessage, args }) => {
      const { logFunction, logType, logMessagePrefix, delimiterInsideMessage } =
        extensionProperties;
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      const logMessages: Message[] = debugMessage.detectAll(
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
