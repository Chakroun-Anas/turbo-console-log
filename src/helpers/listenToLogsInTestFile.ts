import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  readFromGlobalState,
  writeToGlobalState,
  isJavaScriptOrTypeScriptFile,
  isPythonFile,
  getExtensionProperties,
  isProUser,
} from './index';
import { GlobalStateKey } from '@/entities';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { detectAll as detectAllPython } from '@/debug-message/python/detectAll';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { NotificationEventHandler } from './notificationEventHandler';

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
  /(^|\/)test_[^/]+\.py$/i,
  /(^|\/)[^/]+_test\.py$/i,
  /(^|\/)tests?\//i,
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
 * Notification handler for Logs In Test File detection
 * Detects test files with 3+ logs
 */
export const logsInTestFileHandler: NotificationEventHandler = {
  id: 'logsInTestFile',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
    );

    return !hasShownNotification;
  },

  shouldProcess: (editor: vscode.TextEditor): boolean => {
    const document = editor.document;

      const isJS = isJavaScriptOrTypeScriptFile(document);
      const isPython = isPythonFile(document);

      if (!isJS && !isPython) {
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
        const messages = isPython
          ? await detectAllPython(
              fs,
              vscode,
              filePath,
              extensionProperties.logFunction,
              extensionProperties.logMessagePrefix,
              extensionProperties.delimiterInsideMessage,
            )
          : await detectAll(
              fs,
              vscode,
              filePath,
              extensionProperties.logFunction,
              extensionProperties.logMessagePrefix,
              extensionProperties.delimiterInsideMessage,
            );

      if (messages.length >= TEST_FILE_LOG_THRESHOLD) {
        const wasShown = await showNotification(
          NotificationEvent.EXTENSION_LOGS_IN_TEST_FILE,
          version,
          context,
        );

        if (wasShown) {
          writeToGlobalState(
            context,
            GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
            true,
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error detecting logs in test file:', error);
      return false;
    }
  },
};
