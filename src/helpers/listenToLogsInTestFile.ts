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

    if (!isJavaScriptOrTypeScriptFile(document)) {
      return false;
    }

    const filePath = document.uri.fsPath;
    if (!filePath) {
      return false;
    }

    return isTestFile(filePath);
  },

  process: async (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ): Promise<boolean> => {
    const filePath = editor.document.uri.fsPath;

    try {
      const config: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('turboConsoleLog');
      const extensionProperties = getExtensionProperties(config);

      const messages = await detectAll(
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
