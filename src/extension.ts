import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { JSDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { LineCodeProcessing } from './line-code-processing';
import { JSLineCodeProcessing } from './line-code-processing/js';
import { getAllCommands } from './commands/';

export function activate(): void {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing);
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const properties: ExtensionProperties = getExtensionProperties(config);
  const commands: Array<Command> = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, () =>
      handler(properties, jsDebugMessage),
    );
  }
}

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    wrapLogMessage: workspaceConfig.wrapLogMessage ?? false,
    logMessagePrefix: workspaceConfig.logMessagePrefix ?? '🚀',
    logMessageSuffix: workspaceConfig.logMessageSuffix ?? ':',
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd ?? false,
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeFileNameAndLineNum:
      workspaceConfig.includeFileNameAndLineNum ?? false,
    logType: workspaceConfig.logType ?? 'log',
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}
