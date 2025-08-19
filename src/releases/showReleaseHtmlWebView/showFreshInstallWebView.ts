import type { ExtensionContext } from 'vscode';
import { writeToGlobalState } from '@/helpers';
import { getHtmlWebView as freshInstallHtmlWebView } from '@/releases/fresh-install';
import { openWebView } from '@/ui/helpers/';
import { createTelemetryService } from '@/telemetry';

export function showFreshInstallWebView(
  context: ExtensionContext,
  latestWebViewReleaseVersion: string,
): void {
  openWebView(
    `🚀 Welcome To Turbo Console Log Family 🎊`,
    freshInstallHtmlWebView(),
  );
  writeToGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
    true,
  );

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
