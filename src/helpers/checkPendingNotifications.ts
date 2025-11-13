import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

/**
 * Checks for pending notifications scheduled to be shown on next activation
 * Clears the pending flags after showing the notifications
 * @param context VS Code extension context
 * @param version Current extension version
 */
export function checkPendingNotifications(
  context: vscode.ExtensionContext,
  version?: string,
): void {
  // Check for pending ten inserts notification
  const hasPendingTenInsertsNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION,
  );

  if (hasPendingTenInsertsNotification) {
    // Clear the pending flag
    writeToGlobalState(
      context,
      GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION,
      false,
    );

    // Mark that notification has been shown
    writeToGlobalState(
      context,
      GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
      true,
    );

    // Show the notification with version info
    showNotification(NotificationEvent.EXTENSION_TEN_INSERTS, version, context);
  }

  // Check for pending PHP workspace notification
  const hasPendingPhpWorkspaceNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION,
  );

  if (hasPendingPhpWorkspaceNotification) {
    // Clear the pending flag
    writeToGlobalState(
      context,
      GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION,
      false,
    );

    // Show the notification with version info
    showNotification(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      version,
      context,
    );
  }
}
