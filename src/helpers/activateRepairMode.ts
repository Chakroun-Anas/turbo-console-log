import * as vscode from 'vscode';

export function activateRepairMode(): void {
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isRepairMode',
    true,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
}
