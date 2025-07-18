import * as vscode from 'vscode';
import { Command, Message } from '../entities';

export function deleteAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.deleteAllLogMessages',
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
        logMessages.forEach(({ lines }) => {
          const firstLine = lines[0];
          const lastLine = lines[lines.length - 1];

          // Check if line before exists and is empty
          if (firstLine.start.line > 0) {
            const lineBeforeFirstLine = new vscode.Range(
              new vscode.Position(firstLine.start.line - 1, 0),
              new vscode.Position(
                firstLine.start.line - 1,
                document.lineAt(firstLine.start.line - 1).text.length,
              ),
            );
            if (document.lineAt(firstLine.start.line - 1).text === '') {
              editBuilder.delete(lineBeforeFirstLine);
            }
          }

          // Check if line after exists and is empty
          if (lastLine.start.line < document.lineCount - 1) {
            const lineAfterLastLine = new vscode.Range(
              new vscode.Position(lastLine.start.line + 1, 0),
              new vscode.Position(
                lastLine.start.line + 1,
                document.lineAt(lastLine.start.line + 1).text.length,
              ),
            );
            if (document.lineAt(lastLine.start.line + 1).text === '') {
              editBuilder.delete(lineAfterLastLine);
            }
          }

          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    },
  };
}
