import * as vscode from 'vscode';

export function activateReleaseLauncherMode(
  context: vscode.ExtensionContext,
  releaseLauncherView: vscode.TreeView<string>,
): void {
  const visibilityDisposable = releaseLauncherView.onDidChangeVisibility(
    (e: vscode.TreeViewVisibilityChangeEvent) => {
      if (!e.visible) return;
      vscode.commands.executeCommand(
        'setContext',
        'turboConsoleLog:isReleaseLauncherMode',
        false,
      );
    },
  );
  context.subscriptions.push(visibilityDisposable);

  releaseLauncherView.badge = { value: 1, tooltip: 'New Release Available' };

  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isReleaseLauncherMode',
    true,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isNewRelease',
    true,
  );
}
