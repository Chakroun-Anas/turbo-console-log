import * as vscode from 'vscode';
import * as fs from 'fs';
import { Command, Message } from '../entities';
import { trackLogManagementCommands } from '../helpers';
import { phpDebugMessage } from '@/debug-message/php';

export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage } =
        extensionProperties;
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      // For PHP files, use PHP debug message from core
      let activeDebugMessage = debugMessage;
      if (document.languageId === 'php') {
        activeDebugMessage = phpDebugMessage;
      }

      const logMessages: Message[] = await activeDebugMessage.detectAll(
        fs,
        vscode,
        document.uri.fsPath,
        logFunction,
        logMessagePrefix,
        delimiterInsideMessage,
      );
      editor
        .edit((editBuilder) => {
          logMessages.forEach(
            ({ spaces, lines, isCommented, isTurboConsoleLog }) => {
              // Only process Turbo Console Log messages
              if (!isTurboConsoleLog) {
                return;
              }
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
            },
          );
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
            // Track log management command usage
            trackLogManagementCommands(context, 'comment');
          }
        });
    },
  };
}
