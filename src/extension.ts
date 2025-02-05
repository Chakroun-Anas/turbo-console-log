import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { getHtmlWevView as release2110HtmlWebView } from './releases/2110';
import { readFromGlobalState, writeToGlobalState } from './helpers';

const DONATION_LINK = 'https://turboconsolelog.io/sponsorship';
const latestReleaseVersion = '2.11.0';

const RELEASE_NOTES: Record<
  string,
  { webViewHtml: string; notification: string }
> = {
  '2.11.0': {
    webViewHtml: release2110HtmlWebView(),
    notification:
      "We've introduced an **automatic log correction** feature!\n\nYour logs now **update themselves** after refactoring – no manual edits needed!\n\n🚀 Try It Now\n\nRun the new command: `turboConsoleLog.correctAllLogMessages`",
  },
};

export function activate(context: vscode.ExtensionContext): void {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const properties: ExtensionProperties = getExtensionProperties(config);
  const commands: Array<Command> = getAllCommands();

  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler(properties, jsDebugMessage, args);
    });
  }

  showReleaseHtmlWebViewAndNotification(context);
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
    includeLineNum: workspaceConfig.includeLineNum ?? false,
    includeFilename: workspaceConfig.includeFilename ?? false,
    logType: workspaceConfig.logType ?? 'log',
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}

// Function to check version and show notification
function showReleaseHtmlWebViewAndNotification(
  context: vscode.ExtensionContext,
): void {
  const wasNotificationShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestReleaseVersion}`,
  );
  if (!wasNotificationShown) {
    openWhatsNewWebView(RELEASE_NOTES[latestReleaseVersion].webViewHtml);
    setTimeout(() => {
      vscode.window
        .showInformationMessage(
          `Your support is critical to keep Turbo Console Log alive! Consider sponsoring the project.`,
          'Sponsorship',
          'Dismiss',
        )
        .then((selection) => {
          if (selection === 'Sponsor') {
            vscode.env.openExternal(vscode.Uri.parse(DONATION_LINK));
          }
        });
    }, 1000 * 30); // 30 seconds
    writeToGlobalState(
      context,
      `IS_NOTIFICATION_SHOWN_${latestReleaseVersion}`,
      true,
    );
  }
}

function openWhatsNewWebView(htmlContent: string) {
  const panel = vscode.window.createWebviewPanel(
    'turboConsoleLogUpdates',
    '🚀 Turbo Console Log – What’s New',
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = htmlContent;
}
