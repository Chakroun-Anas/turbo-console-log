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
 * Minimum number of logs in a file to be considered "messy"
 */
const MESSY_FILE_LOG_THRESHOLD = 10;

/**
 * Listens to document openings and detects messy files (files with 10+ logs)
 * Shows notification when user opens a JS/TS file with many logs
 * One-time notification per user (global state guard)
 *
 * @param context VS Code extension context
 */
export function listenToJSMessyFileDetection(
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
    GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
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

        // Check if file is "messy" (10+ logs)
        if (messages.length >= MESSY_FILE_LOG_THRESHOLD) {
          // Show notification
          const wasShown = await showNotification(
            NotificationEvent.EXTENSION_JS_MESSY_FILE,
            version,
            context,
          );

          // Only mark as shown if it was actually displayed (not blocked by cooldown)
          if (wasShown) {
            writeToGlobalState(
              context,
              GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
              true,
            );
            disposable.dispose(); // Stop listening once notification shown
          }
        }
      } catch (error) {
        console.error('[Turbo Console Log] Error detecting messy file:', error);
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
