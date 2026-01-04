import * as vscode from 'vscode';
import { isProUser, isPhpFile } from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

let notificationLockUntil = 0; // Timestamp until which notifications are blocked

/**
 * Reset the notification lock (for testing purposes only)
 * @internal
 */
export function resetNotificationLock(): void {
  notificationLockUntil = 0;
}

/**
 * Checks if the user is trying to use PHP logging without Pro
 * Shows notification and returns false if PHP logging is not allowed
 * @param context VS Code extension context
 * @param document The document being edited
 * @param version Extension version for notification tracking
 * @returns true if log insertion should proceed, false if blocked
 */
export function canInsertLogInDocument(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  version: string,
): boolean {
  // Check if it's a PHP file and user is not Pro
  if (isPhpFile(document) && !isProUser(context)) {
    const now = Date.now();

    // Check if notification is still locked
    if (now < notificationLockUntil) {
      return false; // Still locked, prevent duplicate notification
    }

    // Lock for minimum 2 seconds to prevent rapid-fire spam
    notificationLockUntil = now + 2000;

    // Show notification about PHP being Pro-only (non-blocking)
    showNotification(
      NotificationEvent.EXTENSION_PHP_PRO_ONLY,
      version,
      context,
    ).finally(() => {
      // Ensure lock lasts minimum 2 seconds even if network is instant
      const remaining = notificationLockUntil - Date.now();
      if (remaining > 0) {
        setTimeout(() => {
          notificationLockUntil = 0;
        }, remaining);
      } else {
        notificationLockUntil = 0;
      }
    });

    return false;
  }

  return true;
}
