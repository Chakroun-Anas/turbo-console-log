import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { getHtmlWebView as freshInstallHtmlWebView } from './releases/fresh-install';
import { getHtmlWevView as release2110HtmlWebView } from './releases/2110';
import { getHtmlWevView as release2120HtmlWebView } from './releases/2120';
import { getHtmlWevView as release2130HtmlWebView } from './releases/2130';
import { getHtmlWevView as release2140HtmlWebView } from './releases/2140';
import { getHtmlWebView as release2150HtmlWebView } from './releases/2150';
import { getHtmlWebView as release2160HtmlWebView } from './releases/2160';
import { readFromGlobalState, writeToGlobalState } from './helpers';
import { TurboProFreemiumTreeProvider } from './pro';
import { runProBundle } from './commands/activateTurboProBundle';

const previousReleaseVersion = '2.15.0';
const latestReleaseVersion = '2.16.0';

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
  '2.15.0': {
    webViewHtml: release2150HtmlWebView(),
    notification: `Turbo Console Log v2.15.0 is here! ✨

This release marks a **pivot point** toward a more sustainable future — without compromising the open-source core.

✅ Fixed command issues when using a custom log function (issue-265)
✅ Hit a huge milestone: **100+ passing tests**  
🙏 Special thanks to **tzarger** for reporting the key bug!

🧠 PRO version is coming in May — packed with new visual tools!

🤍 Turbo still needs your support more than ever — donations help us stay free, stable, and independent.

📖 Check the full release notes to get all the details!`,
  },
  '2.16.0': {
    webViewHtml: release2160HtmlWebView(),
    notification: `Turbo Console Log v2.16.0 is live! 🌟

This update is all about **first impressions and future vision**.

🆕 Introduced a custom webview for fresh installs — new users now get a tailored onboarding experience  
♻️ Existing users still get updates, but with a cleaner path and a **PRO teaser** included

🎯 Laid the groundwork for **Turbo Console Log PRO** — launching by the end of May:
- A new panel listing all active log entries
- Visual actions to quickly remove, clean, or group logs
- A one-time license. No subscription. Yours forever.

💬 Want to support development or get early access? Donations are still open and appreciated more than ever.

This is just the beginning. Let's build the future of debugging — together. 🚀`,
  },
};

export function activate(context: vscode.ExtensionContext): void {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties: ExtensionProperties =
    getExtensionProperties(config);
  const commands: Array<Command> = getAllCommands();

  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler({
        extensionProperties,
        debugMessage: jsDebugMessage,
        args,
        context,
      });
    });
  }
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(
    context,
    `pro-bundle-${version}`,
  );
  showReleaseHtmlWebViewAndNotification(context);
  if (proLicenseKey && proBundle) {
    runProBundle(
      context,
      extensionProperties,
      proLicenseKey,
      version,
      proBundle,
      true,
    );
    return;
  }
  const freemiumProvider = new TurboProFreemiumTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'turboConsoleLogProView',
      freemiumProvider,
    ),
  );
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
  const wasPreviousReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${previousReleaseVersion}`,
  );
  const wasLatestReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestReleaseVersion}`,
  );

  // Fresh install of the extension
  if (!wasPreviousReleaseWebviewShown && !wasLatestReleaseWebviewShown) {
    openWhatsNewWebView(
      `🚀 Welcome To Turbo Console Log Family 🎊`,
      freshInstallHtmlWebView(),
    );
    writeToGlobalState(
      context,
      `IS_NOTIFICATION_SHOWN_${latestReleaseVersion}`,
      true,
    );
    return;
  }
  // Existing users updating the extension
  if (!wasLatestReleaseWebviewShown) {
    openWhatsNewWebView(
      `🚀 Turbo Console Log - Release ${latestReleaseVersion} Notes`,
      RELEASE_NOTES[latestReleaseVersion].webViewHtml,
    );
    writeToGlobalState(
      context,
      `IS_NOTIFICATION_SHOWN_${latestReleaseVersion}`,
      true,
    );
  }
}

function openWhatsNewWebView(title: string, htmlContent: string) {
  const panel = vscode.window.createWebviewPanel(
    'turboConsoleLogUpdates',
    title,
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = htmlContent;
}
