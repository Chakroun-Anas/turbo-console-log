import * as vscode from 'vscode';

// Permanent "What's New" entry for the current release panel. Plain text only:
// promo countdowns lived here during discount campaigns, and there is no
// campaign in this release.
export function createReleasePanelStatusBarItem(
  version: string,
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10,
  );
  item.command = 'turboConsoleLog.showReleasePanel';
  item.text = `$(rocket) Turbo v${version}`;
  item.tooltip = `What's New in Turbo Console Log v${version}`;
  item.show();
  return item;
}
