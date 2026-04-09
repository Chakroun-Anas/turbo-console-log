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
import { NotificationEventHandler } from './notificationEventHandler';

/**
 * Notification handler for PHP File Openings detection
 * Shows PHP support notification when user opens a PHP file
 */
export const phpFileOpeningsHandler: NotificationEventHandler = {
  id: 'phpFileOpenings',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );

    return !hasShownNotification;
  },

  shouldProcess: (editor: vscode.TextEditor): boolean => {
    return isPhpFile(editor.document);
  },

  process: async (
    _editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ): Promise<boolean> => {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      version,
      context,
    );

    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
        true,
      );
      return true;
    }

    return false;
  },
};
