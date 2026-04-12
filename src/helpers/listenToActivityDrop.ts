import * as vscode from 'vscode';
import {
  readFromGlobalState,
  getUserActivityStatus,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { NotificationEventHandler } from './notificationEventHandler';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FOUR_DAYS_MS = 4 * ONE_DAY_MS;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

/**
 * Notification handler for Activity Drop detection
 * Targets ACTIVE users in 4-6 day drift window
 */
export const activityDropHandler: NotificationEventHandler = {
  id: 'activityDrop',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }
    return true; // Always register, time-based checks happen in shouldProcess
  },

  shouldProcess: (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
  ): boolean => {
    const document = editor.document;

    if (!isJavaScriptOrTypeScriptFile(document)) {
      return false;
    }

    const userActivityStatus = getUserActivityStatus(context);
    if (userActivityStatus !== UserActivityStatus.ACTIVE) {
      return false;
    }

    const lastInsertionDate = readFromGlobalState<number>(
      context,
      GlobalStateKey.LAST_INSERTION_DATE,
    );

    if (lastInsertionDate === undefined) {
      return false;
    }

    const daysSinceLastInsertion = Date.now() - lastInsertionDate;

    if (daysSinceLastInsertion < FOUR_DAYS_MS) {
      return false;
    }

    if (daysSinceLastInsertion >= SEVEN_DAYS_MS) {
      return false;
    }

    return true;
  },

  process: async (
    _editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ): Promise<boolean> => {
    const notificationShown = await showNotification(
      NotificationEvent.EXTENSION_ACTIVITY_DROP,
      version,
      context,
    );
    return notificationShown;
  },
};
