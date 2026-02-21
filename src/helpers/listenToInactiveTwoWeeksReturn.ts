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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * ONE_DAY_MS;
const FOUR_WEEKS_MS = 28 * ONE_DAY_MS;

/**
 * Listens to JS/TS file openings and shows re-engagement notification for inactive users
 * Targets users inactive for 14-28 days who haven't received the manual log notification
 * Provides gentle reintroduction to extension features
 * One-time notification per user (free users only)
 *
 * Users inactive for 28+ days are handled by a separate survey event
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToInactiveTwoWeeksReturn(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users - they're already engaged
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, no need to listen
  }

  // Check if user already received the manual log notification
  // If so, they've already had a reactivation attempt
  const hasShownManualLogNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION,
  );

  if (hasShownManualLogNotification) {
    return; // Already received manual log notification, skip this one
  }

  // Check current activity status
  const userActivityStatus = getUserActivityStatus(context);
  if (userActivityStatus !== UserActivityStatus.INACTIVE) {
    return; // User is ACTIVE, no need to show reactivation message
  }

  // Calculate days since last Turbo usage
  const getDaysSinceLastUsage = (): number => {
    // First check last insertion date
    const lastInsertionDate = readFromGlobalState<number>(
      context,
      GlobalStateKey.LAST_INSERTION_DATE,
    );

    if (lastInsertionDate !== undefined) {
      return Date.now() - lastInsertionDate;
    }

    // Fall back to activity check start date
    const activityCheckStartDate = readFromGlobalState<number>(
      context,
      GlobalStateKey.ACTIVITY_CHECK_START_DATE,
    );

    if (activityCheckStartDate !== undefined) {
      return Date.now() - activityCheckStartDate;
    }

    // No data available - assume just installed (0 days)
    return 0;
  };

  // Listen to active text editor changes (when user opens/switches files)
  const disposable = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (!editor) {
        return;
      }

      const document = editor.document;

      // Filter by file type - only process JS/TS files
      if (!isJavaScriptOrTypeScriptFile(document)) {
        return;
      }

      // Check if user has been inactive for 14-28 days
      const daysSinceLastUsage = getDaysSinceLastUsage();
      if (daysSinceLastUsage < TWO_WEEKS_MS) {
        return; // Not inactive long enough yet (< 14 days)
      }

      if (daysSinceLastUsage >= FOUR_WEEKS_MS) {
        return; // Too inactive - handled by separate 28+ day survey event
      }

      // Show re-engagement notification
      const wasShown = await showNotification(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        version,
        context,
      );

      // Only mark as shown if it was actually displayed (not blocked by cooldown)
      if (wasShown) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION,
          true,
        );
        disposable.dispose(); // Stop listening once notification shown
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
