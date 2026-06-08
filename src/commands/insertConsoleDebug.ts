import * as vscode from 'vscode';
import { Command } from '../entities';
import { getTabSize } from '../utilities';
import { trackLogInsertions } from '../helpers';
import { insertForSelections } from './commandRuntime';

export function insertConsoleDebugCommand(): Command {
  return {
    name: 'turboConsoleLog.insertConsoleDebug',
    handler: async ({ extensionProperties, context }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const tabSize: number = getTabSize(editor.options.tabSize);
      await insertForSelections(
        editor,
        extensionProperties,
        'debug',
        tabSize,
      );

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
