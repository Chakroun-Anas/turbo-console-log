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
 * Minimum number of logs in a file to be considered "messy"
 */
const MESSY_FILE_LOG_THRESHOLD = 10;

/**
 * Notification handler for JS Messy File detection
 * Detects files with 10+ logs
 */
export const jsMessyFileHandler: NotificationEventHandler = {
  id: 'jsMessyFile',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
    );

    return !hasShownNotification;
  },

  shouldProcess: (editor: vscode.TextEditor): boolean => {
    const document = editor.document;

    if (!isJavaScriptOrTypeScriptFile(document)) {
      return false;
    }

    const filePath = document.uri.fsPath;
    return !!filePath;
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

      if (messages.length >= MESSY_FILE_LOG_THRESHOLD) {
        const wasShown = await showNotification(
          NotificationEvent.EXTENSION_JS_MESSY_FILE,
          version,
          context,
        );

        if (wasShown) {
          writeToGlobalState(
            context,
            GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
            true,
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(
        '[Turbo Console Log] Error detecting messy file logs:',
        error,
      );
      return false;
    }
  },
};
