import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { getHtmlWevView as release2110HtmlWebView } from './releases/2110';

const DONATION_LINK = 'https://turboconsolelog.io/sponsorship?showSponsor=true';

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

  // showReleaseHtmlWebViewAndNotification(context);
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
  // const installedVersion = vscode.extensions.getExtension(
  //   'chakrounanas.turbo-console-log',
  // )?.packageJSON.version;
  // if (
  //   installedVersion &&
  //   isVersionGreaterThan(installedVersion, CURRENT_VERSION)
  // ) {
  //   const lastNotifiedVersion =
  //     context.globalState.get<string>(LAST_VERSION_KEY);
  //   // Show notification only if it's a new version
  //   if (lastNotifiedVersion !== installedVersion) {
  //     vscode.window
  //       .showInformationMessage(
  //         `Your support is critical to keep Turbo Console Log alive! Consider sponsoring the project.`,
  //         'Donate',
  //         'Dismiss',
  //       )
  //       .then((selection) => {
  //         if (selection === 'Donate') {
  //           vscode.env.openExternal(vscode.Uri.parse(DONATION_LINK));
  //         }
  //       });
  //     // Update the last notified version
  //     context.globalState.update(LAST_VERSION_KEY, installedVersion);
  //   }
  // }
  openWhatsNewWebView(context, RELEASE_NOTES['2.11.0'].webViewHtml);
  setTimeout(() => {
    vscode.window
      .showInformationMessage(
        `Your support is critical to keep Turbo Console Log alive! Consider sponsoring the project.`,
        'Donate',
        'Dismiss',
      )
      .then((selection) => {
        if (selection === 'Donate') {
          vscode.env.openExternal(vscode.Uri.parse(DONATION_LINK));
        }
      });
  }, 0);
}

function openWhatsNewWebView(
  context: vscode.ExtensionContext,
  htmlContent: string,
) {
  const panel = vscode.window.createWebviewPanel(
    'turboConsoleLogUpdates',
    '🚀 Turbo Console Log – What’s New',
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = htmlContent;
}
