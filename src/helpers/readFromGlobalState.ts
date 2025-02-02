import * as vscode from 'vscode';

export function readFromGlobalState<T>(
  context: vscode.ExtensionContext,
  key: string,
): T | undefined {
  return context.globalState.get<T>(key);
}
