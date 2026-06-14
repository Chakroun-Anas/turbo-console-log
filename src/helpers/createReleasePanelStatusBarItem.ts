import * as vscode from 'vscode';

export function createReleasePanelStatusBarItem(
  version: string,
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10,
  );
  item.text = `$(rocket) Turbo v${version}`;
  item.tooltip = `What's New in Turbo Console Log v${version}`;
  item.command = 'turboConsoleLog.showReleasePanel';
  item.show();
  return item;
}
