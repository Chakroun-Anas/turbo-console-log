import * as vscode from 'vscode';

export function writeToGlobalState(
  context: vscode.ExtensionContext,
  key: string,
  value: unknown,
): Thenable<void> {
  return context.globalState.update(key, value);
}
