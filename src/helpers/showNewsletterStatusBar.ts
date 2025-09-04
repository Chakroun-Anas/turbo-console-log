import * as vscode from 'vscode';
import { writeToGlobalState } from './index';

/**
 * Creates and shows a persistent newsletter status bar item
 * This status bar will persist across VS Code sessions until the user interacts with it
 * @param context VS Code extension context
 */
export function showNewsletterStatusBar(
  context: vscode.ExtensionContext,
): void {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = '🎉 10 logs → Join newsletter 🚀';
  statusBarItem.tooltip =
    'Join our newsletter for exclusive surveys, tips, updates!';

  // Create command for status bar click
  const commandId = `turbo.newsletterCta.${Date.now()}`;
  const disposable = vscode.commands.registerCommand(commandId, async () => {
    // Show toast with CTA and dismiss button
    const toastResult = await vscode.window.showInformationMessage(
      "🎉 Great job! You've used Turbo 10 times. Join our newsletter for exclusive surveys, tips, updates!",
      'Join Newsletter',
      'Later',
      'Dismiss',
    );

    if (toastResult === 'Join Newsletter') {
      try {
        vscode.env.openExternal(
          vscode.Uri.parse('https://www.turboconsolelog.io/join'),
        );
      } catch (error) {
        // Log error but continue with disposal to prevent status bar from being stuck
        console.warn(
          '[Turbo Console Log] Failed to open newsletter URL:',
          error,
        );
      }
      // Remove status bar message after joining and mark as dismissed
      statusBarItem.dispose();
      disposable.dispose();
      writeToGlobalState(context, 'SHOULD_SHOW_NEWSLETTER_STATUS_BAR', false);
    } else if (toastResult === 'Dismiss') {
      // Remove status bar message when dismissed and mark as dismissed
      statusBarItem.dispose();
      disposable.dispose();
      writeToGlobalState(context, 'SHOULD_SHOW_NEWSLETTER_STATUS_BAR', false);
    }
    // If "Later" or no selection (ESC), keep status bar visible and flag enabled
  });

  statusBarItem.command = commandId;
  statusBarItem.show();

  // Ensure disposables are properly cleaned up when extension deactivates
  context.subscriptions.push(statusBarItem, disposable);
}
