import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  showNewsletterStatusBar,
} from './index';
import { createTelemetryService } from '../telemetry';

/**
 * Tracks the new user journey for log insertion commands
 * Shows newsletter notification after 10 command uses and sends telemetry
 * @param context VS Code extension context
 */
export async function trackNewUserJourney(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Check if user is new and hasn't seen the milestone notification yet
  const isNewUser = readFromGlobalState<boolean>(context, 'IS_NEW_USER');
  const hasShownTenCommandsMilestoneNotification = readFromGlobalState<boolean>(
    context,
    'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
  );

  // Only track for new users who haven't seen the notification
  if (!isNewUser || hasShownTenCommandsMilestoneNotification) {
    return;
  }

  // Increment command usage count
  let commandUsageCount =
    readFromGlobalState<number>(context, 'COMMAND_USAGE_COUNT') || 0;
  commandUsageCount++;
  writeToGlobalState(context, 'COMMAND_USAGE_COUNT', commandUsageCount);

  // Check if user has reached the 10 command milestone
  if (commandUsageCount === 10) {
    // Show newsletter notification with actions (non-blocking)
    const notificationPromise = vscode.window.showInformationMessage(
      "🎉 Great job! You've used Turbo 10 times. Join our newsletter for exclusive surveys, tips, updates!",
      'Join Newsletter',
      'Maybe Later',
    );

    // Handle notification result asynchronously (don't block)
    notificationPromise.then((result) => {
      if (result === 'Join Newsletter') {
        vscode.env.openExternal(
          vscode.Uri.parse('https://www.turboconsolelog.io/join'),
        );
      }
    });

    // Show persistent newsletter status bar that survives VS Code reloads
    showNewsletterStatusBar(context);

    // Set flag to indicate that status bar should be shown on future activations
    writeToGlobalState(context, 'SHOULD_SHOW_NEWSLETTER_STATUS_BAR', true);

    // Mark that notification has been shown and user is no longer "new" (immediately)
    writeToGlobalState(
      context,
      'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
      true,
    );

    // Send telemetry event (immediately)
    try {
      const telemetryService = createTelemetryService();
      await telemetryService.reportCommandsInserted(context, 10);
    } catch (error) {
      // Silently fail - telemetry should never break the extension
      console.warn(
        '[Turbo Console Log] Failed to send commands inserted analytics:',
        error,
      );
    }
  }
}
