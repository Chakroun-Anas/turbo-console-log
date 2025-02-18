import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { getHtmlWevView as release2110HtmlWebView } from './releases/2110';
import { getHtmlWevView as release2120HtmlWebView } from './releases/2120';
import { readFromGlobalState, writeToGlobalState } from './helpers';

const DONATION_LINK = 'https://turboconsolelog.io/sponsorship?showSponsor=true';
const latestReleaseVersion = '2.12.0';

const RELEASE_NOTES: Record<
  string,
  { webViewHtml: string; notification: string }
> = {
  '2.11.0': {
    webViewHtml: release2110HtmlWebView(),
    notification:
      "We've introduced an **automatic log correction** feature!\n\nYour logs now **update themselves** after refactoring – no manual edits needed!\n\n🚀 Try It Now\n\nRun the new command: `turboConsoleLog.correctAllLogMessages`",
  },
  '2.12.0': {
    webViewHtml: release2120HtmlWebView(),
    notification:
      'Turbo Console Log v2.12.0 is out! This release makes the extension MORE STABLE than ever with critical bug fixes, more details in the release note.',
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
          `Turbo Console Log needs YOUR support more than ever! Please Consider sponsoring the project!`,
          'Sponsor',
          'Dismiss',
        )
        .then((selection) => {
          if (selection === 'Sponsor') {
            vscode.env.openExternal(vscode.Uri.parse(DONATION_LINK));
          }
        });
    }, 1000 * 15); // Show after 15 seconds
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
