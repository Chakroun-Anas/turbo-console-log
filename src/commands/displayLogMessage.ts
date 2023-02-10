import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties } from '../entities';
import { getTabSize } from '../utilities';

export function displayLogMessageCommand(): Command {
  return {
    name: 'turboConsoleLog.displayLogMessage',
    handler: async (
      extensionProperties: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;
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
            jsDebugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              tabSize,
              extensionProperties,
            );
          });
        }
      }
    },
  };
}
