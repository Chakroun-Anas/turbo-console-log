import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { NotificationEventHandler } from './notificationEventHandler';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
const TWO_WEEKS_MS = 14 * ONE_DAY_MS;

/**
 * Calculate days since extension was first installed
 */
function getDaysSinceInstall(context: vscode.ExtensionContext): number {
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
 * Notification handler for Activation Day Seven
 * Targets new users with zero usage between 7-14 days after install
 */
export const activationDaySevenHandler: NotificationEventHandler = {
  id: 'activationDaySeven',

  shouldRegister: (context: vscode.ExtensionContext): boolean => {
    if (isProUser(context)) {
      return false;
    }

    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
    );

    if (hasShownNotification) {
      return false;
    }

    const commandUsageCount =
      readFromGlobalState<number>(
        context,
        GlobalStateKey.COMMAND_USAGE_COUNT,
      ) || 0;

    return commandUsageCount === 0;
  },

  shouldProcess: (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
  ): boolean => {
    const document = editor.document;

    if (!isJavaScriptOrTypeScriptFile(document)) {
      return false;
    }

    const currentUsageCount =
      readFromGlobalState<number>(
        context,
        GlobalStateKey.COMMAND_USAGE_COUNT,
      ) || 0;

    if (currentUsageCount > 0) {
      return false;
    }

    const daysSinceInstall = getDaysSinceInstall(context);

    if (daysSinceInstall < SEVEN_DAYS_MS) {
      return false;
    }

    if (daysSinceInstall >= TWO_WEEKS_MS) {
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
      NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
      version,
      context,
    );

    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
        true,
      );
      return true;
    }

    return false;
  },
};
