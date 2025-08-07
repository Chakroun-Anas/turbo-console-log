import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { openWebView } from '@/ui';
import { releaseNotes } from '../releaseNotes';
import { createTelemetryService } from '@/telemetry';

export function showLatestReleaseWebView(
  context: ExtensionContext,
  latestWebViewReleaseVersion: string,
): void {
  const wasLatestReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
  );
  if (wasLatestReleaseWebviewShown) {
    return;
  }

  // Show notification first, respecting user agency
  vscode.window
    .showInformationMessage(
      `🚀 Your time matters! We've adapted our release communication so we can get the most out of each other.`,
      'View Release Notes',
      'Later',
    )
    .then((selection) => {
      if (selection === 'View Release Notes') {
        const releaseData = releaseNotes[latestWebViewReleaseVersion];

        // Use external URL if available (new approach for future releases),
        // otherwise fallback to webview (legacy releases)
        if (releaseData.releaseArticleUrl) {
          vscode.env.openExternal(
            vscode.Uri.parse(releaseData.releaseArticleUrl),
          );
        } else if (releaseData.webViewHtml) {
          openWebView(
            `🚀 Turbo Console Log - Release ${latestWebViewReleaseVersion} Notes`,
            releaseData.webViewHtml,
          );
        } else {
          // Fallback: if neither URL nor HTML is available, show error
          vscode.window.showErrorMessage(
            `Release notes for version ${latestWebViewReleaseVersion} are not available.`,
          );
        }
      }
    });

  // Mark notification as shown regardless of user choice to avoid spam
  writeToGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
    true,
  );

  // Report extension update (respects telemetry settings)
  try {
    const telemetryService = createTelemetryService();
    telemetryService.reportUpdate(context);
  } catch (error) {
    // Silently fail - telemetry should never break the extension
    console.warn(
      '[Turbo Console Log] Failed to initialize analytics provider:',
      error,
    );
  }
}
