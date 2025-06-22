import * as vscode from 'vscode';

export function activateProMode(): void {
  vscode.commands.executeCommand('setContext', 'turboConsoleLog:isPro', true);
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
}
