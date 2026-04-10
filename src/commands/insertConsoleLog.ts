import * as vscode from 'vscode';
import { Command } from '../entities';
import { getTabSize } from '../utilities';
import { trackLogInsertions, canInsertLogInDocument } from '../helpers';
import { insertForSelections } from './commandRuntime';

export function insertConsoleLogCommand(): Command {
  return {
    name: 'turboConsoleLog.insertConsoleLog',
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;

      // Get extension version
      const version = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;

      // Check if log insertion is allowed (PHP requires Pro)
      const canInsert = canInsertLogInDocument(context, document, version);
      if (!canInsert) {
        return;
      }

      await insertForSelections(
        editor,
        context,
        extensionProperties,
        debugMessage,
        'log',
        tabSize,
      );

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
