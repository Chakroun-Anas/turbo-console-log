import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

/**
 * Tracks log management commands usage (comment, uncomment, delete)
 * Shows notification after 5 uses to promote centralized Pro features
 * @param context VS Code extension context
 */
export function trackLogManagementCommands(
  context: vscode.ExtensionContext,
): void {
  // Get extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Increment log management command usage count (track for all users, including Pro)
  let logManagementCommandUsageCount =
    readFromGlobalState<number>(
      context,
      GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
    ) || 0;
  logManagementCommandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
    logManagementCommandUsageCount,
  );

  // Don't show Pro upsell notifications to Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if user has reached the 5 log management commands milestone
  const hasShownFiveLogManagementCommandsNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
    );

  if (
    !hasShownFiveLogManagementCommandsNotification &&
    logManagementCommandUsageCount === 5
  ) {
    // Mark that notification has been shown
    writeToGlobalState(
      context,
      GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
      true,
    );

    // Show five log management commands notification (non-blocking) with version info
    showNotification(
      NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
      version,
      context,
    );
  }
}
