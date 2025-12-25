import * as vscode from 'vscode';
import * as fs from 'fs';
import { Command, Message } from '../entities';
import {
  loadPhpDebugMessage,
  canInsertLogInDocument,
  trackLogManagementCommands,
} from '../helpers';

export function deleteAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.deleteAllLogMessages',
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage } =
        extensionProperties;
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      // Get extension version
      const version = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;

      // Check if log operations are allowed (PHP requires Pro)
      const canOperate = canInsertLogInDocument(context, document, version);
      if (!canOperate) {
        return;
      }

      // For PHP files, load PHP debug message from Pro bundle
      let activeDebugMessage = debugMessage;
      if (document.languageId === 'php') {
        const phpDebugMessage = await loadPhpDebugMessage(context);
        if (!phpDebugMessage) {
          vscode.window.showErrorMessage(
            'Failed to load PHP support from Pro bundle.',
          );
          return;
        }
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
          logMessages.forEach(({ lines, isTurboConsoleLog }) => {
            // Only process Turbo Console Log messages
            if (!isTurboConsoleLog) {
              return;
            }
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
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
            // Track log management command usage
            trackLogManagementCommands(context, 'delete');
          }
        });
    },
  };
}
