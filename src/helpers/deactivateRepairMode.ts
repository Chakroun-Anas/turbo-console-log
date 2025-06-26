import * as vscode from 'vscode';

export function deactivateRepairMode(): void {
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isRepairMode',
    false,
  );
}
