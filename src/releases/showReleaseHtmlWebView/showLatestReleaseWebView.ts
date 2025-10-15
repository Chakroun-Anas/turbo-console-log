import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  showReleaseStatusBar,
} from '@/helpers';
import { createTelemetryService } from '@/telemetry';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

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

  // Set IS_NEW_USER to false since an existing user receiving an update is no longer a new user
  writeToGlobalState(context, 'IS_NEW_USER', false);

  const notificationMessage: string =
    'Turbo v3.8.0: Pro Hide Logs, 85% smaller bundle, 89% faster startup & enhanced AST accuracy 🚀';
  const ctaUrl: string = `${TURBO_WEBSITE_BASE_URL}/articles/release-380`;
  const ctaText: string = "See What's New";
  const ctaLaterText: string = 'Remind Me Later';

  // Show notification first (non-blocking)
  const buttons = [ctaText, ctaLaterText];
  const notificationPromise = vscode.window.showInformationMessage(
    notificationMessage,
    ...buttons,
  );

  // Handle notification result asynchronously (don't block)
  notificationPromise.then((selection) => {
    // Check if selection matches the CTA text
    if (selection === ctaText) {
      vscode.env.openExternal(vscode.Uri.parse(ctaUrl));
    }
  });

  // Show persistent release status bar that survives VS Code reloads
  showReleaseStatusBar(context, latestWebViewReleaseVersion);

  // Set flag to indicate that status bar should be shown on future activations
  writeToGlobalState(context, 'SHOULD_SHOW_RELEASE_STATUS_BAR', true);

  // Mark notification as shown (immediately)
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
