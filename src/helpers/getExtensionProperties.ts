import * as vscode from 'vscode';

export function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    wrapLogMessage: workspaceConfig.wrapLogMessage || false,
    logMessagePrefix: workspaceConfig.logMessagePrefix || '🚀',
    logMessageSuffix: workspaceConfig.logMessageSuffix || ':',
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd || false,
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    logCorrectionNotificationEnabled:
      workspaceConfig.logCorrectionNotificationEnabled || false,
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage || false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage || false,
    quote: workspaceConfig.quote || '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage || '~',
    includeLineNum: workspaceConfig.includeLineNum || false,
    includeFilename: workspaceConfig.includeFilename || false,
    logFunction: workspaceConfig.logFunction || 'log',
  };
}
