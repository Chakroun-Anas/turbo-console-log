import * as vscode from 'vscode';
import { Command, Message } from '../entities';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: async ({ extensionProperties, debugMessage }) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage } =
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
        logMessagePrefix,
        delimiterInsideMessage,
      );
      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ spaces, lines, isCommented }) => {
            if (!isCommented) {
              return; // Skip uncommenting if the message is not commented
            }
            lines.forEach((line: vscode.Range) => {
              editBuilder.delete(line);
              editBuilder.insert(
                new vscode.Position(line.start.line, 0),
                `${spaces}${document.getText(line).replace(/\/\//, '').trim()}\n`,
              );
            });
          });
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
          }
        });
    },
  };
}
