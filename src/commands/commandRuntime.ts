import * as vscode from 'vscode';
import { ExtensionProperties } from '@/entities';
import {
  type InsertCommandLogType,
  resolveDebugRuntime,
  resolveLogFunctionForRuntime,
} from '@/helpers/resolveDebugRuntime';

export async function insertForSelections(
  editor: vscode.TextEditor,
  extensionProperties: ExtensionProperties,
  requestedLogType: InsertCommandLogType,
  tabSize: number,
): Promise<boolean> {
  const runtime = resolveDebugRuntime(editor.document);

  const logFunction = resolveLogFunctionForRuntime(
    runtime.language,
    requestedLogType,
    extensionProperties.logFunction || 'log',
  );

  for (let index = 0; index < editor.selections.length; index++) {
    const selection = editor.selections[index];
    let wordUnderCursor = '';
    const rangeUnderCursor = editor.document.getWordRangeAtPosition(
      selection.active,
    );
    if (rangeUnderCursor) {
      wordUnderCursor = editor.document.getText(rangeUnderCursor);
    }

    const selectedVar = editor.document.getText(selection) || wordUnderCursor;
    if (selectedVar.trim().length === 0) {
      continue;
    }

    await editor.edit((editBuilder) => {
      runtime.debugMessage.msg(
        editBuilder,
        editor.document,
        selectedVar,
        selection.active.line,
        tabSize,
        extensionProperties,
        logFunction,
      );
    });
  }

  return true;
}
