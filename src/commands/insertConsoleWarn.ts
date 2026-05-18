import * as vscode from 'vscode';
import { Command } from '../entities';
import { getTabSize } from '../utilities';
import { trackLogInsertions } from '../helpers';

export function insertConsoleWarnCommand(): Command {
  return {
    name: 'turboConsoleLog.insertConsoleWarn',
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;

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
              'warn',
            );
          });
        }
      }

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
