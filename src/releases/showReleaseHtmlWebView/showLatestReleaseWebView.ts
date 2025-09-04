import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  showReleaseStatusBar,
  isProUser,
} from '@/helpers';
import { createTelemetryService } from '@/telemetry';
import { fetchCustomReleaseMessage } from '@/utilities/fetchCustomReleaseMessage';

export async function showLatestReleaseWebView(
  context: ExtensionContext,
  latestWebViewReleaseVersion: string,
): Promise<void> {
  const wasLatestReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
  );
  if (wasLatestReleaseWebviewShown) {
    return;
  }

  // Set IS_NEW_USER to false since an existing user receiving an update is no longer a new user
  writeToGlobalState(context, 'IS_NEW_USER', false);

  // Determine message based on user type and fetch custom message if needed
  const userIsPro = isProUser(context);
  let notificationMessage: string;
  let ctaUrl: string | undefined;
  let ctaText: string | undefined;
  let countryFlag: string | undefined;

  if (userIsPro) {
    // Pro users get a static message about enjoying their pro bundle
    notificationMessage = `Hope you're enjoying your Turbo Pro bundle! v${latestWebViewReleaseVersion} 🚀`;
    ctaUrl = undefined; // No CTA for pro users
    ctaText = undefined;
  } else {
    // Non-pro users get dynamic message from API
    try {
      const customMessage = await fetchCustomReleaseMessage(
        `v${latestWebViewReleaseVersion}`,
      );
      if (customMessage) {
        notificationMessage = customMessage.message;
        ctaUrl = customMessage.ctaUrl;
        ctaText = customMessage.ctaText;
        countryFlag = customMessage.countryFlag;
      } else {
        // Fallback message when API fails
        notificationMessage = `🌎 Turbo Console Log ${latestWebViewReleaseVersion} introduces regional pricing!`;
        ctaUrl = 'https://www.turboconsolelog.io/pro';
        ctaText = 'Check Pro';
        countryFlag = '🌎';
      }
    } catch (error) {
      // Fallback message when API call fails
      console.warn(
        '[Turbo Console Log] Failed to get custom release message:',
        error,
      );
      notificationMessage = `🌎 Turbo Console Log ${latestWebViewReleaseVersion} introduces regional pricing!`;
      ctaUrl = 'https://www.turboconsolelog.io/pro';
      ctaText = 'Check Pro';
      countryFlag = '🌎';
    }
  }

  // Show notification first (non-blocking)
  const buttons = [];
  if (!userIsPro && ctaUrl) {
    buttons.push(ctaText || 'Check Pro');
    buttons.push('Maybe Later');
  }

  const notificationPromise = vscode.window.showInformationMessage(
    notificationMessage,
    ...buttons,
  );

  // Handle notification result asynchronously (don't block)
  notificationPromise.then((selection) => {
    // Check if selection matches the dynamic CTA text
    const expectedCtaText = ctaText || 'Check Pro';
    if (selection === expectedCtaText && ctaUrl) {
      vscode.env.openExternal(vscode.Uri.parse(ctaUrl));
    }
  });

  if (!userIsPro) {
    // Persist the release data for status bar reuse
    writeToGlobalState(context, 'RELEASE_COUNTRY_FLAG', countryFlag ?? '🌎');
    writeToGlobalState(context, 'RELEASE_CTA_URL', ctaUrl);
    writeToGlobalState(context, 'RELEASE_CTA_TEXT', ctaText);

    // Show persistent release status bar that survives VS Code reloads
    showReleaseStatusBar(
      context,
      latestWebViewReleaseVersion,
      countryFlag ?? '🌎',
      ctaUrl,
      ctaText,
    );

    // Set flag to indicate that status bar should be shown on future activations
    writeToGlobalState(context, 'SHOULD_SHOW_RELEASE_STATUS_BAR', true);
  }

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
