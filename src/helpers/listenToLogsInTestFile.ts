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
 * Minimum number of logs in a test file to trigger notification
 */
const TEST_FILE_LOG_THRESHOLD = 3;

/**
 * Test file patterns to detect
 */
const TEST_FILE_PATTERNS = [
  /\.test\.(ts|js|tsx|jsx)$/i,
  /\.spec\.(ts|js|tsx|jsx)$/i,
  /__tests__\//i,
  /\.test\.php$/i,
  /\.spec\.php$/i,
];

/**
 * Checks if file path matches test file patterns
 * @param filePath File path to check
 * @returns True if file is a test file
 */
function isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Listens to document openings and detects logs in test files
 * Shows notification when user opens a test file with 3+ logs
 * One-time notification per user (global state guard)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToLogsInTestFile(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
  );
  if (hasShownNotification) {
    return;
  }

  // Get extension properties for log detection config
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties = getExtensionProperties(config);

  // Listen to active text editor changes
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

      // Check if it's a test file
      if (!isTestFile(filePath)) {
        return;
      }

      try {
        // Detect all logs in the test file
        const messages = await detectAll(
          fs,
          vscode,
          filePath,
          extensionProperties.logFunction,
          extensionProperties.logMessagePrefix,
          extensionProperties.delimiterInsideMessage,
        );

        // Check if test file has enough logs to trigger notification
        if (messages.length >= TEST_FILE_LOG_THRESHOLD) {
          // Show notification
          const wasShown = await showNotification(
            NotificationEvent.EXTENSION_LOGS_IN_TEST_FILE,
            version,
            context,
          );

          // Only mark as shown if it was actually displayed
          if (wasShown) {
            writeToGlobalState(
              context,
              GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
              true,
            );
            // Stop listening - notification shown
            disposable.dispose();
          }
        }
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Error detecting logs in test file:', error);
      }
    },
  );

  context.subscriptions.push(disposable);
}
