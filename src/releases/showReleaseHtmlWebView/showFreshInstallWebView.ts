import * as vscode from 'vscode';
import type { ExtensionContext } from 'vscode';
import { writeToGlobalState } from '@/helpers';
import { createTelemetryService } from '@/telemetry';

export function showFreshInstallWebView(
  context: ExtensionContext,
  latestWebViewReleaseVersion: string,
): void {
  vscode.window.showInformationMessage(
    'Welcome aboard 🚀 Turbo is ready to boost your debugging!',
  );
  writeToGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
    true,
  );

  // Mark user as new user for the fresh install journey
  writeToGlobalState(context, 'IS_NEW_USER', true);
  writeToGlobalState(context, 'COMMAND_USAGE_COUNT', 0);
  writeToGlobalState(
    context,
    'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
    false,
  );
  writeToGlobalState(context, 'SHOULD_SHOW_NEWSLETTER_STATUS_BAR', false);

  // Report fresh install (respects telemetry settings)
  try {
    const telemetryService = createTelemetryService();
    telemetryService.reportFreshInstall();
  } catch (error) {
    // Silently fail - telemetry should never break the extension
    console.warn(
      '[Turbo Console Log] Failed to initialize analytics provider:',
      error,
    );
  }
}
