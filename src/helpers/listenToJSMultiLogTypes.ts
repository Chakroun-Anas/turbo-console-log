import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  readFromGlobalState,
  writeToGlobalState,
  isJavaScriptOrTypeScriptFile,
  getExtensionProperties,
  isProUser,
} from './index';
import { GlobalStateKey } from '@/entities';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Minimum number of different log types to trigger notification
 * Example: file has both console.log and console.error = 2 types
 */
const MIN_LOG_TYPES_THRESHOLD = 2;

/**
 * Detects unique log types in the detected messages
 * Extracts log function from message metadata
 */
function getUniqueLogTypes(
  messages: Array<{ logFunction?: string }>,
): Set<string> {
  const logTypes = new Set<string>();

  for (const message of messages) {
    if (message.logFunction) {
      logTypes.add(message.logFunction);
    }
  }

  return logTypes;
}

/**
 * Listens to document openings and detects files with multiple log types
 * Shows notification when user opens a JS/TS file with 2+ different log types (console.log, console.error, etc.)
 * One-time notification per user (global state guard)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToJSMultiLogTypes(
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
    GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
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

      // Check if it's a JS/TS file
      if (!isJavaScriptOrTypeScriptFile(document)) {
        return;
      }

      // Get file path
      const filePath = document.uri.fsPath;
      if (!filePath) {
        return;
      }

      try {
        // Detect all logs in the file (runs in background)
        const messages = await detectAll(
          fs,
          vscode,
          filePath,
          extensionProperties.logFunction,
          extensionProperties.logMessagePrefix,
          extensionProperties.delimiterInsideMessage,
        );

        // Get unique log types
        const uniqueLogTypes = getUniqueLogTypes(messages);

        // Check if file has multiple log types (2+)
        if (uniqueLogTypes.size >= MIN_LOG_TYPES_THRESHOLD) {
          // Show notification
          const wasShown = await showNotification(
            NotificationEvent.EXTENSION_JS_MULTI_LOG_TYPES,
            version,
            context,
          );

          // Only mark as shown if it was actually displayed (not blocked by cooldown)
          if (wasShown) {
            writeToGlobalState(
              context,
              GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
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

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
