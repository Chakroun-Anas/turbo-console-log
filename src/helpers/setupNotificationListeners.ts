import * as vscode from 'vscode';
import { listenToFileOpeningNotifications } from './listenToFileOpeningNotifications';
import { allNotificationHandlers } from './notificationHandlers';
import { listenToManualConsoleLogs } from './listenToManualConsoleLogs';
import { listenToCommitWithLogs } from './listenToCommitWithLogs';
import { listenToLogLibraryInstalled } from './listenToLogLibraryInstalled';
import { listenToWeekendTurboSundays } from './listenToWeekendTurboSundays';

/**
 * Sets up all notification event listeners for the extension
 *
 * This consolidates all notification listener setup into a single function:
 * - File opening listeners (12 handlers via listenToFileOpeningNotifications)
 * - Manual console.log typing detection (text document changes)
 * - Git commit with logs detection (Git API)
 * - Logging library installation detection (file system watcher)
 * - Weekend Turbo Sundays notification (synchronous check)
 *
 * @param context Extension context
 * @param version Extension version
 */
export function setupNotificationListeners(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // ===========================================================================
  // FILE OPENING NOTIFICATION LISTENER
  // ===========================================================================
  // Consolidates 12 file-opening-based notification handlers into a single
  // onDidChangeActiveTextEditor listener for optimal performance
  // Handlers: PHP file openings, messy files, multi-log-types, activity drop,
  //           inactive return, activation days, test file logs, custom log library
  listenToFileOpeningNotifications(context, version, allNotificationHandlers);

  // ===========================================================================
  // OTHER NOTIFICATION LISTENERS
  // ===========================================================================
  // These listeners use different trigger mechanisms (not file openings):

  // Listen to manual console.log typing for INACTIVE users (re-engagement strategy)
  // Trigger: onDidChangeTextDocument (text editing events)
  listenToManualConsoleLogs(context);

  // Listen to Git commits with logs and show notification
  // Trigger: Git Extension API repository.state.onDidChange
  listenToCommitWithLogs(context, version);

  // Listen to logging library installation and show notification
  // Trigger: FileSystemWatcher on lock files (package-lock.json, pnpm-lock.yaml, yarn.lock)
  listenToLogLibraryInstalled(context, version);

  // Show weekend Turbo Sundays article notification (if it's weekend)
  // Trigger: None - synchronous check during activation
  listenToWeekendTurboSundays(context, version);
}
