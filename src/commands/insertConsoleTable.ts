import * as vscode from 'vscode';
import { Command } from '../entities';
import { getTabSize } from '../utilities';
import { trackLogInsertions } from '../helpers';
import { insertForSelections } from './commandRuntime';

const PHP_DEBUGGING_COMMANDS_MESSAGE =
  'PHP debugging commands: Ctrl/Cmd+K Ctrl/Cmd+L (var_dump), Ctrl/Cmd+K Ctrl/Cmd+N (print_r), Ctrl/Cmd+K Ctrl/Cmd+B/E (error_log)';

export function insertConsoleTableCommand(): Command {
  return {
    name: 'turboConsoleLog.insertConsoleTable',
    handler: async ({ extensionProperties, context }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document: vscode.TextDocument = editor.document;
      if (document.languageId === 'php') {
        vscode.window.showInformationMessage(PHP_DEBUGGING_COMMANDS_MESSAGE);
        return;
      }

      const tabSize: number = getTabSize(editor.options.tabSize);
      await insertForSelections(
        editor,
        extensionProperties,
        'table',
        tabSize,
      );

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
