import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  isPhpFile,
  isProUser,
} from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';

/**
 * Listens to document openings and shows PHP support notification when user opens a PHP file
 * Shows notification immediately (not delayed) for better engagement (v3.10.0 strategy)
 * One-time notification per user (free users only - Pro users already have access)
 *
 * @param context VS Code extension context
 */
export function listenToPhpFileOpenings(
  context: vscode.ExtensionContext,
): void {
  // Skip for Pro users - they already have PHP access
  if (isProUser(context)) {
    return;
  }

  // Get extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Listen to active text editor changes (when user opens/switches files)
  const disposable = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (!editor) {
        return;
      }

      const document = editor.document;

      // Check if notification has already been shown
      const hasShownNotification = readFromGlobalState<boolean>(
        context,
        GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
      );

      if (hasShownNotification) {
        return; // Already shown, skip
      }

      // Check if it's a PHP file
      if (isPhpFile(document)) {
        // Mark as shown immediately to avoid duplicate notifications
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
          true,
        );

        // Show notification immediately (v3.10.0 strategy)
        await showNotification(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          version,
          context,
        );
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
