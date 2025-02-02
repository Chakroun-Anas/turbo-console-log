import * as vscode from 'vscode';

export function writeToGlobalState(
  context: vscode.ExtensionContext,
  key: string,
  value: unknown,
): void {
  context.globalState.update(key, value);
}
