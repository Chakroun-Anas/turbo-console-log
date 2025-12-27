import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

export type LogManagementCommandType =
  | 'comment'
  | 'uncomment'
  | 'delete'
  | 'correct';

/**
 * Tracks log management commands usage (comment, uncomment, delete, correct)
 * Shows notification after 5 uses to promote centralized Pro features
 * @param context VS Code extension context
 * @param commandType Type of command being tracked
 */
export async function trackLogManagementCommands(
  context: vscode.ExtensionContext,
  commandType: LogManagementCommandType,
): Promise<void> {
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

  const hasShownFiveLogManagementCommandsNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
    );

  if (
    !hasShownFiveLogManagementCommandsNotification &&
    logManagementCommandUsageCount >= 5 &&
    !isProUser(context)
  ) {
    // Show five log management commands notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
        true,
      );
    }
    return;
  }

  const commandTypeMapping = {
    comment: {
      countKey: GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT,
      notificationShownKey:
        GlobalStateKey.HAS_SHOWN_FIVE_COMMENTS_COMMANDS_NOTIFICATION,
      event: NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
    },
    uncomment: {
      countKey: GlobalStateKey.UNCOMMENT_COMMAND_USAGE_COUNT,
      notificationShownKey:
        GlobalStateKey.HAS_SHOWN_FIVE_UNCOMMENTS_COMMANDS_NOTIFICATION,
      event: NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
    },
    correct: {
      countKey: GlobalStateKey.CORRECTION_COMMAND_USAGE_COUNT,
      notificationShownKey:
        GlobalStateKey.HAS_SHOWN_FIVE_CORRECTIONS_COMMANDS_NOTIFICATION,
      event: NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
    },
    delete: {
      countKey: GlobalStateKey.DELETE_COMMAND_USAGE_COUNT,
      notificationShownKey:
        GlobalStateKey.HAS_SHOWN_FIVE_DELETE_COMMANDS_NOTIFICATION,
      event: NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
    },
  };

  const mapping = commandTypeMapping[commandType];
  let commandTypeCount =
    readFromGlobalState<number>(context, mapping.countKey) || 0;
  commandTypeCount++;
  writeToGlobalState(context, mapping.countKey, commandTypeCount);

  // Don't show Pro upsell notifications to Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if this specific command type has reached 5 uses
  const hasShownSpecificNotification = readFromGlobalState<boolean>(
    context,
    mapping.notificationShownKey,
  );

  if (!hasShownSpecificNotification && commandTypeCount >= 5) {
    // Show specific command notification
    const wasShown = await showNotification(mapping.event, version, context);

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(context, mapping.notificationShownKey, true);
    }
    return;
  }
}
