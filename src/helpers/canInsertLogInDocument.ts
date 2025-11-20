import * as vscode from 'vscode';
import { isProUser, isPhpFile } from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

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
  version?: string,
): boolean {
  // Check if it's a PHP file and user is not Pro
  if (isPhpFile(document) && !isProUser(context)) {
    // Show notification about PHP being Pro-only (non-blocking)
    showNotification(
      NotificationEvent.EXTENSION_PHP_PRO_ONLY,
      version,
      context,
    );
    return false;
  }

  return true;
}
