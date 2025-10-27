import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  isFreshInstall,
} from './index';
import { createTelemetryService } from '../telemetry';
import { GlobalStateKey } from '@/entities';

/**
 * Tracks the new user journey for log insertion commands
 * Shows newsletter notification after 10 command uses and sends telemetry
 * @param context VS Code extension context
 */
export async function trackNewUserJourney(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Check if user is on fresh install and hasn't seen the milestone notification yet
  const isOnFreshInstall = isFreshInstall(context);
  const hasShownTenCommandsMilestoneNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION,
  );

  // Only track for fresh install users who haven't seen the notification
  if (!isOnFreshInstall || hasShownTenCommandsMilestoneNotification) {
    return;
  }

  // Increment command usage count
  let commandUsageCount =
    readFromGlobalState<number>(context, GlobalStateKey.COMMAND_USAGE_COUNT) ||
    0;
  commandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.COMMAND_USAGE_COUNT,
    commandUsageCount,
  );

  // Check if user has reached the 10 command milestone
  if (commandUsageCount === 10) {
    // Show newsletter notification with actions (non-blocking, one-time only)
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

    // Mark that notification has been shown (no persistent status bar)
    writeToGlobalState(
      context,
      GlobalStateKey.HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION,
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
