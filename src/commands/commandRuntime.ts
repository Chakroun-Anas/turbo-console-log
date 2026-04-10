import * as vscode from 'vscode';
import { DebugMessage } from '@/debug-message';
import { ExtensionProperties } from '@/entities';
import {
  InsertCommandLogType,
  ResolvedDebugRuntime,
  resolveDebugRuntime,
  resolveLogFunctionForRuntime,
} from '@/helpers';

export async function getActiveDebugRuntime(
  document: vscode.TextDocument,
  debugMessage: DebugMessage,
): Promise<ResolvedDebugRuntime> {
  return resolveDebugRuntime(document, debugMessage);
}

export async function insertForSelections(
  editor: vscode.TextEditor,
  extensionProperties: ExtensionProperties,
  debugMessage: DebugMessage,
  requestedLogType: InsertCommandLogType,
  tabSize: number,
): Promise<boolean> {
  const runtime = await getActiveDebugRuntime(editor.document, debugMessage);

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
