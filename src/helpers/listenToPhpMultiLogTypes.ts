import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  isPhpFile,
  getExtensionProperties,
  isProUser,
} from './index';
import { GlobalStateKey } from '@/entities';
import { detectAll } from '@/debug-message/php/detectAll';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { Message } from '@/entities/extension/message';

/**
 * Minimum number of different log types to trigger notification
 */
const MIN_LOG_TYPES_THRESHOLD = 2;

/**
 * Extracts unique log function types from an array of messages
 * Filters out messages without logFunction property
 */
function getUniqueLogTypes(messages: Message[]): string[] {
  const logTypes = messages
    .map((msg) => msg.logFunction)
    .filter((logFunc): logFunc is string => logFunc !== undefined);

  return Array.from(new Set(logTypes));
}

/**
 * Listens to document openings and detects PHP files with multiple log types
 * Shows notification promoting Pro's color-coding feature for different log types
 * One-time notification per user (global state guard)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToPhpMultiLogTypes(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown BEFORE setting up listener
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
  );
  if (hasShownNotification) {
    return; // Already shown, no need to listen
  }

  // Get extension properties for log detection config
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties = getExtensionProperties(config);

  // Listen to active text editor changes (when user opens/switches files)
  const disposable = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (!editor) {
        return;
      }

      const document = editor.document;

      // Check if it's a PHP file
      if (!isPhpFile(document)) {
        return;
      }

      // Get file path
      const filePath = document.uri.fsPath;
      if (!filePath) {
        return;
      }

      try {
        // Detect all logs in the PHP file
        const messages = await detectAll(
          filePath,
          extensionProperties.logFunction,
          extensionProperties.logMessagePrefix,
          extensionProperties.delimiterInsideMessage,
        );

        // Extract unique log types
        const uniqueLogTypes = getUniqueLogTypes(messages);

        // Check if file has multiple log types (2+)
        if (uniqueLogTypes.length >= MIN_LOG_TYPES_THRESHOLD) {
          // Show notification
          const wasShown = await showNotification(
            NotificationEvent.EXTENSION_PHP_MULTI_LOG_TYPES,
            version,
            context,
          );

          // Only mark as shown if it was actually displayed (not blocked by cooldown)
          if (wasShown) {
            writeToGlobalState(
              context,
              GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
              true,
            );
            disposable.dispose(); // Stop listening once notification shown
          }
        }
      } catch (error) {
        console.error(
          '[Turbo Console Log] Error detecting multi-type logs:',
          error,
        );
      }
    },
  );

  // Add disposable to context so it's cleaned up on deactivation
  context.subscriptions.push(disposable);
}
