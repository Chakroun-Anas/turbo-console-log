import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  getUserActivityStatus,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { NotificationEventHandler } from './notificationEventHandler';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * ONE_DAY_MS;
const FOUR_WEEKS_MS = 28 * ONE_DAY_MS;

/**
 * Calculate days since last Turbo usage
 */
function getDaysSinceLastUsage(context: vscode.ExtensionContext): number {
  const lastInsertionDate = readFromGlobalState<number>(
    context,
    GlobalStateKey.LAST_INSERTION_DATE,
  );

  if (lastInsertionDate !== undefined) {
    return Date.now() - lastInsertionDate;
  }

  const activityCheckStartDate = readFromGlobalState<number>(
    context,
    GlobalStateKey.ACTIVITY_CHECK_START_DATE,
  );

  if (activityCheckStartDate !== undefined) {
    return Date.now() - activityCheckStartDate;
  }

  return 0;
}

/**
 * Notification handler for Inactive Two Weeks Return
 * Targets INACTIVE users who haven't used extension in 14-28 days
 */
export const inactiveTwoWeeksReturnHandler: NotificationEventHandler = {
  id: 'inactiveTwoWeeksReturn',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION,
    );

    if (hasShownNotification) {
      return false;
    }

    const hasShownManualLogNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION,
    );

    if (hasShownManualLogNotification) {
      return false;
    }

    const userActivityStatus = getUserActivityStatus(context);
    return userActivityStatus === UserActivityStatus.INACTIVE;
  },

  shouldProcess: (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
  ): boolean => {
    const document = editor.document;

    if (!isJavaScriptOrTypeScriptFile(document)) {
      return false;
    }

    const daysSinceLastUsage = getDaysSinceLastUsage(context);

    if (daysSinceLastUsage < TWO_WEEKS_MS) {
      return false;
    }

    if (daysSinceLastUsage >= FOUR_WEEKS_MS) {
      return false;
    }

    return true;
  },

  process: async (
    _editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ): Promise<boolean> => {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
      version,
      context,
    );

    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION,
        true,
      );
      return true;
    }

    return false;
  },
};
