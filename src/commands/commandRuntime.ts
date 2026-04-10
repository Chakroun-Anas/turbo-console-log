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
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  debugMessage: DebugMessage,
): Promise<ResolvedDebugRuntime | null> {
  const runtime = await resolveDebugRuntime(context, document, debugMessage);
  if (!runtime) {
    vscode.window.showErrorMessage(
      'Failed to load language support for the current document.',
    );
    return null;
  }

  return runtime;
}

export async function insertForSelections(
  editor: vscode.TextEditor,
  context: vscode.ExtensionContext,
  extensionProperties: ExtensionProperties,
  debugMessage: DebugMessage,
  requestedLogType: InsertCommandLogType,
  tabSize: number,
): Promise<boolean> {
  const runtime = await getActiveDebugRuntime(
    context,
    editor.document,
    debugMessage,
  );
  if (!runtime) {
    return false;
  }

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