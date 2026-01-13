import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Checks if the current time is during the weekend (Saturday or Sunday)
 */
function isWeekend(): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Shows Turbo Sundays article notification during weekends
 * Shows notification once per user lifetime when they activate extension on weekend
 * One-time notification (global state guard)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export async function listenToWeekendTurboSundays(
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
  // Skip for Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WEEKEND_TURBO_SUNDAYS_NOTIFICATION,
  );
  if (hasShownNotification) {
    return; // Already shown
  }

  // Check if it's currently the weekend
  if (!isWeekend()) {
    return; // Not weekend
  }

  try {
    // Show notification immediately during activation
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_WEEKEND_TURBO_SUNDAYS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_WEEKEND_TURBO_SUNDAYS_NOTIFICATION,
        true,
      );
    }
  } catch (error) {
    console.error(
      '[Turbo Console Log] Error showing weekend notification:',
      error,
    );
  }
}
