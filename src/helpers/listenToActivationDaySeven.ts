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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
const TWO_WEEKS_MS = 14 * ONE_DAY_MS;

/**
 * Listens to JS/TS file openings and shows second activation notification for new users
 * Targets users with zero usage (COMMAND_USAGE_COUNT === 0) between 7-14 days after install
 * Final attempt to activate users before they become "inactive" (14+ days)
 * One-time notification per user (free users only)
 *
 * Works in conjunction with Day 3 event - both can show to same user (graduated escalation)
 * Users who reach 14 days are handled by the two-week return event
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToActivationDaySeven(
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
    GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, no need to listen
  }

  // Check if user has used the extension at all
  const commandUsageCount =
    readFromGlobalState<number>(context, GlobalStateKey.COMMAND_USAGE_COUNT) ||
    0;

  if (commandUsageCount > 0) {
    return; // User already tried the extension, no need for activation nudge
  }

  // Calculate days since extension was first installed
  const getDaysSinceInstall = (): number => {
    // Use activity check start date as proxy for install date
    // (This is set when user first installs the extension)
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

      // Re-check usage count on each trigger (user might have used it since listener started)
      const currentUsageCount =
        readFromGlobalState<number>(
          context,
          GlobalStateKey.COMMAND_USAGE_COUNT,
        ) || 0;

      if (currentUsageCount > 0) {
        disposable.dispose(); // User activated, stop listening
        return;
      }

      // Check if user is in the 7-14 day activation window
      const daysSinceInstall = getDaysSinceInstall();
      if (daysSinceInstall < SEVEN_DAYS_MS) {
        return; // Too early (< 7 days)
      }

      if (daysSinceInstall >= TWO_WEEKS_MS) {
        disposable.dispose(); // Too late - handled by two-week return event
        return;
      }

      // Show activation notification
      const wasShown = await showNotification(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        version,
        context,
      );

      // Only mark as shown if it was actually displayed (not blocked by cooldown)
      if (wasShown) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
          true,
        );
        disposable.dispose(); // Stop listening once notification shown
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
