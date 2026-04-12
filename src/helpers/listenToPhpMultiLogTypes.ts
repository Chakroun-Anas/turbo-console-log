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
import { NotificationEventHandler } from './notificationEventHandler';

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
 * Notification handler for PHP Multi Log Types detection
 * Detects PHP files with multiple log types
 */
export const phpMultiLogTypesHandler: NotificationEventHandler = {
  id: 'phpMultiLogTypes',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
    );

    return !hasShownNotification;
  },

  shouldProcess: (editor: vscode.TextEditor): boolean => {
    const document = editor.document;

    if (!isPhpFile(document)) {
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
        filePath,
        extensionProperties.logFunction,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
      );

      const uniqueLogTypes = getUniqueLogTypes(messages);

      if (uniqueLogTypes.length >= MIN_LOG_TYPES_THRESHOLD) {
        const wasShown = await showNotification(
          NotificationEvent.EXTENSION_PHP_MULTI_LOG_TYPES,
          version,
          context,
        );

        if (wasShown) {
          writeToGlobalState(
            context,
            GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
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
