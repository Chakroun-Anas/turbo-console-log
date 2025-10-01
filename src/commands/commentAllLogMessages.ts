import * as vscode from 'vscode';
import * as fs from 'fs';
import { Command, Message } from '../entities';

export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: async ({ extensionProperties, debugMessage }) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage } =
        extensionProperties;
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const logMessages: Message[] = await debugMessage.detectAll(
        fs,
        vscode,
        document.uri.fsPath,
        logFunction,
        logMessagePrefix,
        delimiterInsideMessage,
      );
      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ spaces, lines, isCommented }) => {
            if (isCommented) {
              return; // Skip commenting if the message is already commented
            }
            lines.forEach((line: vscode.Range) => {
              editBuilder.delete(line);
              editBuilder.insert(
                new vscode.Position(line.start.line, 0),
                `${spaces}// ${document.getText(line).trim()}\n`,
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
