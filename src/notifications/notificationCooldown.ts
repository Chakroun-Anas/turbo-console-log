import vscode from 'vscode';
import { NotificationEvent } from './NotificationEvent';
import {
  NotificationPriority,
  NOTIFICATION_PRIORITY_MAP,
  COOLDOWN_CONFIG,
} from './NotificationPriority';
import { GlobalStateKey } from '@/entities';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';

/**
 * Represents a queued notification item
 */
export interface QueuedNotification {
  event: NotificationEvent;
  version?: string;
  queuedAt: number; // Timestamp when queued
}

/**
 * Checks if a notification should be shown based on cooldown rules and priority
 * @returns Object indicating if should show, and if not, whether to queue
 */
export function shouldShowNotification(
  context: vscode.ExtensionContext,
  notificationEvent: NotificationEvent,
): boolean {
  const priority = NOTIFICATION_PRIORITY_MAP[notificationEvent];

  // BYPASS notifications always show immediately
  if (priority === NotificationPriority.BYPASS) {
    return true;
  }

  // Check if we're in cooldown period
  const lastShown = readFromGlobalState<number>(
    context,
    GlobalStateKey.LAST_SHOWN_NOTIFICATION,
  );
  const now = Date.now();
  const inCooldown =
    lastShown !== undefined &&
    now - lastShown < COOLDOWN_CONFIG.COOLDOWN_PERIOD_MS;
  return !inCooldown;
}

/**
 * Records that a notification was shown (updates last shown timestamp)
 */
export function recordNotificationShown(
  context: vscode.ExtensionContext,
): void {
  writeToGlobalState(
    context,
    GlobalStateKey.LAST_SHOWN_NOTIFICATION,
    Date.now(),
  );
}
