import * as vscode from 'vscode';
import { listenToFileOpeningNotifications } from './listenToFileOpeningNotifications';
import { allNotificationHandlers } from './notificationHandlers';
import { listenToManualConsoleLogs } from './listenToManualConsoleLogs';

/**
 * Sets up all notification event listeners for the extension
 *
 * This consolidates all notification listener setup into a single function:
 * - File opening listeners (2 handlers via listenToFileOpeningNotifications) - REDUCED from 12
 * - Manual console.log typing detection (text document changes)
 *
 * v3.21.2: Disabled 3 PLG marketing listeners to reduce notification fatigue:
 * - Git commit with logs detection
 * - Logging library installation detection
 * - Weekend Turbo Sundays notification
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
  // Consolidates file-opening-based notification handlers into a single
  // onDidChangeActiveTextEditor listener for optimal performance
  // v3.21.2: Reduced to 2 handlers (inactive two weeks return + activation day 7)
  listenToFileOpeningNotifications(context, version, allNotificationHandlers);

  // ===========================================================================
  // OTHER NOTIFICATION LISTENERS
  // ===========================================================================
  // These listeners use different trigger mechanisms (not file openings):

  // Listen to manual console.log typing for INACTIVE users (re-engagement strategy)
  // Trigger: onDidChangeTextDocument (text editing events)
  listenToManualConsoleLogs(context);

  // v3.21.2: All time-based and workflow-based notification listeners removed
}
