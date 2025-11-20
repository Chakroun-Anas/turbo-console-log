import * as vscode from 'vscode';
import { Command } from '../entities';
import { getTabSize } from '../utilities';
import { trackLogInsertions, canInsertLogInDocument } from '../helpers';

export function insertConsoleTableCommand(): Command {
  return {
    name: 'turboConsoleLog.insertConsoleTable',
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

      // For PHP files, notify about available commands
      if (document.languageId === 'php') {
        vscode.window.showInformationMessage(
          'PHP debugging commands: Ctrl/Cmd+K Ctrl/Cmd+L (var_dump), Ctrl/Cmd+K Ctrl/Cmd+N (print_r), Ctrl/Cmd+K Ctrl/Cmd+B/E (error_log)',
        );
        return;
      }
      for (let index = 0; index < editor.selections.length; index++) {
        const selection: vscode.Selection = editor.selections[index];
        let wordUnderCursor = '';
        const rangeUnderCursor: vscode.Range | undefined =
          document.getWordRangeAtPosition(selection.active);
        // if rangeUnderCursor is undefined, `document.getText(undefined)` will return the entire file.
        if (rangeUnderCursor) {
          wordUnderCursor = document.getText(rangeUnderCursor);
        }
        const selectedVar: string =
          document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVar: number = selection.active.line;
        if (selectedVar.trim().length !== 0) {
          await editor.edit((editBuilder) => {
            debugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              tabSize,
              extensionProperties,
              'table',
            );
          });
        }
      }

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
