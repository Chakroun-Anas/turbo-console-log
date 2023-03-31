import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';

export function deleteAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.deleteAllLogMessages',
    handler: async (
      {
        delimiterInsideMessage,
        logMessagePrefix,
        logFunction,
      }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
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
        logMessagePrefix,
        delimiterInsideMessage,
      );
      editor.edit((editBuilder) => {
        logMessages.forEach(({ lines }) => {
          const firstLine = lines[0];
          const lastLine = lines[lines.length - 1];
          const lineBeforeFirstLine = new vscode.Range(
            new vscode.Position(firstLine.start.line - 1, 0),
            new vscode.Position(firstLine.end.line - 1, 0),
          );
          const lineAfterLastLine = new vscode.Range(
            new vscode.Position(lastLine.start.line + 1, 0),
            new vscode.Position(lastLine.end.line + 1, 0),
          );
          if (document.lineAt(lineBeforeFirstLine.start).text === '') {
            editBuilder.delete(lineBeforeFirstLine);
          }
          if (document.lineAt(lineAfterLastLine.start).text === '') {
            editBuilder.delete(lineAfterLastLine);
          }
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    },
  };
}
