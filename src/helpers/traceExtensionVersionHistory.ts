import type { ExtensionContext } from 'vscode';
import { GlobalStateKey } from '@/entities';
import { readFromGlobalState } from './readFromGlobalState';
import { writeToGlobalState } from './writeToGlobalState';
import { createTelemetryService } from '@/telemetry';
import { showNotification, NotificationEvent } from '@/notifications';

/**
 * Traces extension version history by maintaining an array of versions the user has installed.
 * This enables reliable "new user" vs "existing user" detection that works
 * independently of whether notifications were shown (important for contextual notifications).
 *
 * Also handles:
 * - Telemetry reporting for fresh installs and updates
 * - Fresh install welcome notification
 * - User journey initialization
 *
 * Migration logic:
 * - If version history doesn't exist, check legacy IS_NEW_USER flag
 * - If IS_NEW_USER === false (existing user), initialize with current version and mark as update
 * - If IS_NEW_USER !== false (new user), initialize with current version and mark as fresh install
 * - If version history exists, append current version if not already present
 *
 * @param context - VS Code extension context
 * @param currentVersion - Current extension version (e.g., '3.9.0')
 */
export function traceExtensionVersionHistory(
  context: ExtensionContext,
  currentVersion: string,
): void {
  // Read existing version history
  let versionHistory = readFromGlobalState<string[]>(
    context,
    GlobalStateKey.EXTENSION_VERSION_HISTORY,
  );

  let isFreshInstall = false;
  let isUpdate = false;

  if (!versionHistory || versionHistory.length === 0) {
    // Version history doesn't exist - this is the first time running v3.9.0+
    // Check legacy IS_NEW_USER flag to determine if user is existing or new
    const isNewUser = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.IS_NEW_USER,
    );

    if (isNewUser === false) {
      // Legacy existing user - initialize with current version
      // (We don't know their previous version, but we know they're upgrading)
      versionHistory = [currentVersion];
      isUpdate = true;
    } else {
      // We saw IS_NEW_USER === true (installed sometime between last release)
      // We must decide whether this should be treated as a true fresh install.
      // If the user already has the ten-commands milestone flag defined (true or false),
      // we consider them not eligible for a fresh-install welcome to avoid double-reporting.
      const hasShownTenCommandsMilestoneNotification =
        readFromGlobalState<boolean>(
          context,
          GlobalStateKey.HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION,
        );

      if (typeof hasShownTenCommandsMilestoneNotification === 'undefined') {
        // No milestone flag present -> treat as genuine fresh install
        versionHistory = [currentVersion];
        isFreshInstall = true;
      } else {
        // Milestone flag already present -> existing user from between releases
        versionHistory = [currentVersion];
        isUpdate = true; // Report as update (they're upgrading)
      }
    }
  } else {
    // Version history exists - append current version if not already present
    if (!versionHistory.includes(currentVersion)) {
      versionHistory = [...versionHistory, currentVersion];
      isUpdate = true;
    }
  }

  // Persist updated version history
  writeToGlobalState(
    context,
    GlobalStateKey.EXTENSION_VERSION_HISTORY,
    versionHistory,
  );

  // Handle fresh install welcome and journey initialization
  if (isFreshInstall) {
    // Show welcome notification with version info
    showNotification(
      NotificationEvent.EXTENSION_FRESH_INSTALL,
      currentVersion,
      context,
    );
    // Initialize fresh install journey tracking
    writeToGlobalState(context, 'COMMAND_USAGE_COUNT', 0);
    writeToGlobalState(
      context,
      'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
      false,
    );
  }

  // Report telemetry for fresh installs and updates (decoupled from notifications)
  try {
    const telemetryService = createTelemetryService();
    if (isFreshInstall) {
      telemetryService.reportFreshInstall();
    } else if (isUpdate) {
      telemetryService.reportUpdate(context);
    }
  } catch (error) {
    // Silently fail - telemetry should never break the extension
    console.warn(
      '[Turbo Console Log] Failed to report telemetry in traceExtensionVersionHistory:',
      error,
    );
  }
}
