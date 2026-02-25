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
const THREE_DAYS_MS = 3 * ONE_DAY_MS;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

/**
 * Listens to JS/TS file openings and shows activation notification for new users
 * Targets users with zero usage (COMMAND_USAGE_COUNT === 0) between 3-7 days after install
 * Provides action-oriented nudge to try the extension before they forget about it
 * One-time notification per user (free users only)
 *
 * Users who reach 7 days without usage are handled by a separate Day 7 event
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToActivationDayThree(
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
    GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION,
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

      // Check if user is in the 3-7 day activation window
      const daysSinceInstall = getDaysSinceInstall();
      if (daysSinceInstall < THREE_DAYS_MS) {
        return; // Too early (< 3 days)
      }

      if (daysSinceInstall >= SEVEN_DAYS_MS) {
        disposable.dispose(); // Too late - handled by Day 7 event
        return;
      }

      // Show activation notification
      const wasShown = await showNotification(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_THREE,
        version,
        context,
      );

      // Only mark as shown if it was actually displayed (not blocked by cooldown)
      if (wasShown) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION,
          true,
        );
        disposable.dispose(); // Stop listening once notification shown
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
