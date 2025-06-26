import * as vscode from 'vscode';

export function activateFreemiumMode(): void {
  vscode.commands.executeCommand('setContext', 'turboConsoleLog:isPro', false);
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isRepairMode',
    false,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
}
