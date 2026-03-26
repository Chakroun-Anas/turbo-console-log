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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FOUR_DAYS_MS = 4 * ONE_DAY_MS;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

/**
 * Listens to JS/TS file openings and shows activity drop notification for drifting users
 * Targets ACTIVE users who haven't used Turbo in 4-6 days (before they become INACTIVE at 7 days)
 * Provides proactive retention nudge to prevent full inactivity
 *
 * Design:
 * - Triggers in 4-6 day window (3-day window before INACTIVE transition at 7 days)
 * - Disposes listener after showing to prevent spam within same session
 * - Can recur in future sessions if user remains in drift window (subject to backend cooldown)
 * - Server-side 48h cooldown + monthly limit prevent abuse across sessions
 * - Automatically stops when user reaches INACTIVE status (clean handoff to INACTIVE_TWO_WEEKS_RETURN)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToActivityDrop(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users - they're already engaged
  if (isProUser(context)) {
    return;
  }

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

      // Only target ACTIVE users (skip INACTIVE - they're handled by other events)
      const userActivityStatus = getUserActivityStatus(context);
      if (userActivityStatus !== UserActivityStatus.ACTIVE) {
        return; // User is INACTIVE, skip this event
      }

      // Check if user has a last insertion date (must have used Turbo before)
      const lastInsertionDate = readFromGlobalState<number>(
        context,
        GlobalStateKey.LAST_INSERTION_DATE,
      );

      if (lastInsertionDate === undefined) {
        return; // User has never inserted logs, not the right event for them
      }

      // Calculate days since last Turbo usage
      const daysSinceLastInsertion = Date.now() - lastInsertionDate;

      // Check if user is in the 4-6 day drift window
      if (daysSinceLastInsertion < FOUR_DAYS_MS) {
        return; // Too early (< 4 days since last insertion)
      }

      if (daysSinceLastInsertion >= SEVEN_DAYS_MS) {
        return; // Too late (7+ days - user will become INACTIVE soon)
      }

      // Show activity drop notification
      const notificationShown = await showNotification(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        version,
        context,
      );

      // Dispose listener after showing to prevent multiple notifications in same session
      // Can recur in future sessions if user remains in drift window (subject to backend cooldown)
      if (notificationShown) {
        disposable.dispose();
      }
    },
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
