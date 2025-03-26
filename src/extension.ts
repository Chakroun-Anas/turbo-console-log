import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { getHtmlWevView as release2110HtmlWebView } from './releases/2110';
import { getHtmlWevView as release2120HtmlWebView } from './releases/2120';
import { getHtmlWevView as release2130HtmlWebView } from './releases/2130';
import { getHtmlWevView as release2140HtmlWebView } from './releases/2140';
import { readFromGlobalState, writeToGlobalState } from './helpers';

const latestReleaseVersion = '2.14.0';

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
  '2.13.0': {
    webViewHtml: release2130HtmlWebView(),
    notification:
      'Turbo Console Log v2.13.0 is here! 🚀\n\nThis release brings **smarter log placement**, improved **quote selection**, and **better TypeScript support**.\n\n🔹 Logs now appear exactly where they should in **object & array assignments**.\n🔹 **Single-line expressions** are now handled with precision.\n🔹 **Quote selection** intelligently adapts to variable content.\n\n🔍 Read the full release notes to explore all the fixes & improvements!',
  },
  '2.14.0': {
    webViewHtml: release2140HtmlWebView(),
    notification: `Turbo Console Log v2.14.0 is live! 🔥

This update sharpens the engine with **precision fixes** and paves the way for what's next.

✅ Improved function call log placement  
✅ Better quote handling in object logs  
✅ Edge-case fix for anonymous arrow functions  
✅ More accurate positioning around returns

🎯 It’s all about **stability, trust, and long-term value**.

📰 Read the full release note to dive in!`,
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
    '🚀 Turbo Console Log - Release v2.14.0 Notes',
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = htmlContent;
}
