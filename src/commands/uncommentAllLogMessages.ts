import * as vscode from 'vscode';
import * as fs from 'fs';
import { Command, Message } from '../entities';
import {
  loadPhpDebugMessage,
  canInsertLogInDocument,
  trackLogManagementCommands,
} from '../helpers';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
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
          logMessages.forEach(
            ({ spaces, lines, isCommented, isTurboConsoleLog }) => {
              // Only process Turbo Console Log messages
              if (!isTurboConsoleLog) {
                return;
              }
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
            },
          );
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
            // Track log management command usage
            trackLogManagementCommands(context);
          }
        });
    },
  };
}
