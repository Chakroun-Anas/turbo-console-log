import * as vscode from 'vscode';
import { writeToGlobalState } from './index';

/**
 * Creates and shows a persistent release notification status bar item
 * This status bar will persist across VS Code sessions until the user interacts with it
 * @param context VS Code extension context
 * @param latestWebViewReleaseVersion The latest release version to show
 * @param countryFlag The country flag to display
 * @param ctaUrl The CTA URL to open when user wants to check Pro
 * @param ctaText The CTA text to display
 */
export function showReleaseStatusBar(
  context: vscode.ExtensionContext,
  latestWebViewReleaseVersion: string,
  countryFlag: string,
  ctaUrl?: string,
  ctaText?: string,
): void {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = `🚀 v${latestWebViewReleaseVersion} → Regional pricing! ${countryFlag} `;
  statusBarItem.tooltip = 'Turbo Console Log introduces regional pricing!';

  // Create command for status bar click
  const commandId = `turbo.releaseCta.${Date.now()}`;
  const disposable = vscode.commands.registerCommand(commandId, async () => {
    // Build buttons array based on available actions
    const buttons = [];
    if (ctaUrl) {
      buttons.push(ctaText || 'Check Pro');
    }
    buttons.push('Maybe Later', 'Dismiss');

    // Show toast with appropriate buttons
    const toastResult = await vscode.window.showInformationMessage(
      `${countryFlag} Turbo Console Log v${latestWebViewReleaseVersion} introduces regional pricing!`,
      ...buttons,
    );

    // Handle CTA action (Check Pro / Get Turbo Pro)
    const expectedCtaText = ctaText || 'Check Pro';
    if (toastResult === expectedCtaText && ctaUrl) {
      vscode.env.openExternal(vscode.Uri.parse(ctaUrl));
      // Remove status bar and mark as dismissed
      statusBarItem.dispose();
      disposable.dispose();
      writeToGlobalState(context, 'SHOULD_SHOW_RELEASE_STATUS_BAR', false);
    } else if (toastResult === 'Dismiss') {
      // Remove status bar message when dismissed and mark as dismissed
      statusBarItem.dispose();
      disposable.dispose();
      writeToGlobalState(context, 'SHOULD_SHOW_RELEASE_STATUS_BAR', false);
    }
    // If "Maybe Later" or no selection (ESC), keep status bar visible and flag enabled
  });

  statusBarItem.command = commandId;
  statusBarItem.show();

  // Ensure disposables are properly cleaned up when extension deactivates
  context.subscriptions.push(statusBarItem, disposable);
}
