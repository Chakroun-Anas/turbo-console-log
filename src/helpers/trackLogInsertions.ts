import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

/**
 * Tracks log insertion commands usage
 * Shows ten inserts notification after 10 uses (educational, free users only)
 * Shows fifty inserts notification after 50 uses (conversion, free users only)
 * @param context VS Code extension context
 */
export async function trackLogInsertions(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Increment command usage count (track for all users, including Pro)
  let commandUsageCount =
    readFromGlobalState<number>(context, GlobalStateKey.COMMAND_USAGE_COUNT) ||
    0;
  commandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.COMMAND_USAGE_COUNT,
    commandUsageCount,
  );

  // Don't show Pro upsell notifications to Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if user has reached the 10 inserts milestone (educational)
  const hasShownTenInsertsMilestoneNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
  );

  if (!hasShownTenInsertsMilestoneNotification && commandUsageCount === 10) {
    // Mark that notification has been shown
    writeToGlobalState(
      context,
      GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
      true,
    );

    // Show ten inserts milestone notification (non-blocking, educational)
    showNotification(NotificationEvent.EXTENSION_TEN_INSERTS);
  }

  // Check if user has reached the 50 inserts milestone
  const hasShownFiftyInsertsMilestoneNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION,
    );

  if (!hasShownFiftyInsertsMilestoneNotification && commandUsageCount === 50) {
    // Mark that notification has been shown
    writeToGlobalState(
      context,
      GlobalStateKey.HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION,
      true,
    );

    // Show fifty inserts milestone notification (non-blocking)
    showNotification(NotificationEvent.EXTENSION_FIFTY_INSERTS);
  }
}
