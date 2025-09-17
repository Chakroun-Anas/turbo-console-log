import * as vscode from 'vscode';
import { writeToGlobalState } from './index';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Creates and shows a persistent release notification status bar item
 * This status bar will persist across VS Code sessions until the user interacts with it
 * @param context VS Code extension context
 * @param latestWebViewReleaseVersion The latest release version to show
 * @param ctaUrl The CTA URL to open when user wants to check Pro
 * @param ctaText The CTA text to display
 */
export function showReleaseStatusBar(
  context: vscode.ExtensionContext,
  latestWebViewReleaseVersion: string,
): void {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = `🚀 v${latestWebViewReleaseVersion} → Decide what is next for Turbo!`;
  statusBarItem.tooltip =
    'Take a one minute survey shaping the future of Turbo';

  // Create command for status bar click
  const commandId = `turbo.releaseCta.${Date.now()}`;
  const disposable = vscode.commands.registerCommand(commandId, async () => {
    // Build buttons array based on available actions
    const buttons = ['Take Survey', 'Maybe Later', 'Dismiss'];

    // Show toast with appropriate buttons
    const toastResult = await vscode.window.showInformationMessage(
      'Decide what is next for Turbo by taking a one minute survey 🚀',
      ...buttons,
    );

    // Handle CTA actions
    if (toastResult === 'Take Survey') {
      vscode.env.openExternal(
        vscode.Uri.parse(TURBO_WEBSITE_BASE_URL + '/community-survey'),
      );
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
