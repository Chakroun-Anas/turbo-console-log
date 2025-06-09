import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from '../../helpers/';
import { openWebView } from './openWebView';
import { releaseNotes } from '../../releases';
import { getHtmlWebView as freshInstallHtmlWebView } from '../../releases/fresh-install';

export function showReleaseHtmlWebViewAndNotification(
  context: vscode.ExtensionContext,
  previousWebViewReleaseVersion: string,
  latestWebViewReleaseVersion: string,
): void {
  const wasPreviousReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${previousWebViewReleaseVersion}`,
  );
  const wasLatestReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
  );

  // Fresh install of the extension
  if (!wasPreviousReleaseWebviewShown && !wasLatestReleaseWebviewShown) {
    openWebView(
      `🚀 Welcome To Turbo Console Log Family 🎊`,
      freshInstallHtmlWebView(),
    );
    writeToGlobalState(
      context,
      `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
      true,
    );
    return;
  }
  // Existing users updating the extension
  if (!wasLatestReleaseWebviewShown) {
    openWebView(
      `🚀 Turbo Console Log - Release ${latestWebViewReleaseVersion} Notes`,
      releaseNotes[latestWebViewReleaseVersion].webViewHtml,
    );
    writeToGlobalState(
      context,
      `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
      true,
    );
  }
}
