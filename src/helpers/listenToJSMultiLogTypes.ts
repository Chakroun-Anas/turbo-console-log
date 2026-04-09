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
 * Notification handler for JS Multi Log Types detection
 * Detects files with multiple log types (console.log, console.error, etc.)
 */
export const jsMultiLogTypesHandler: NotificationEventHandler = {
  id: 'jsMultiLogTypes',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
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

      const uniqueLogTypes = getUniqueLogTypes(messages);

      if (uniqueLogTypes.size >= MIN_LOG_TYPES_THRESHOLD) {
        const wasShown = await showNotification(
          NotificationEvent.EXTENSION_JS_MULTI_LOG_TYPES,
          version,
          context,
        );

        if (wasShown) {
          writeToGlobalState(
            context,
            GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
            true,
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(
        '[Turbo Console Log] Error detecting multi-type logs:',
        error,
      );
      return false;
    }
  },
};
