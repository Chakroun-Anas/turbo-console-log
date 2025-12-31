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
import { createTelemetryService } from '@/telemetry/telemetryService';

/**
 * Maximum number of notifications allowed per user per month
 * Note: BYPASS priority notifications (e.g., bi-weekly releases) don't count against this limit
 * With 2 release notifications per month, this gives ~6 total notifications
 */
const MAX_NOTIFICATIONS_PER_MONTH = 4;

/**
 * Number of consecutive dismissals before pausing notifications until end of month
 */
const MAX_CONSECUTIVE_DISMISSALS = 3;

/**
 * Gets the current month key in YYYY-MM format
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Gets the timestamp for the end of the current month
 */
function getEndOfMonthTimestamp(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // First day of next month at 00:00:00
  const endOfMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return endOfMonth.getTime();
}

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

  // BYPASS notifications always show immediately (don't count against monthly limit)
  if (priority === NotificationPriority.BYPASS) {
    return true;
  }

  // Check if notifications are paused due to consecutive dismissals
  const pausedUntil = readFromGlobalState<number>(
    context,
    GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
  );

  if (pausedUntil !== undefined) {
    const now = Date.now();
    if (now < pausedUntil) {
      // Still paused
      return false;
    } else {
      // Pause expired - clear it
      writeToGlobalState(
        context,
        GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
        undefined,
      );
      writeToGlobalState(
        context,
        GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
        0,
      );
    }
  }

  // Check monthly notification limit (read-only check)
  const currentMonthKey = getCurrentMonthKey();
  const storedMonthKey = readFromGlobalState<string>(
    context,
    GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
  );

  // If month changed or no month key exists, treat counter as 0
  const monthlyCount =
    storedMonthKey === currentMonthKey
      ? (readFromGlobalState<number>(
          context,
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        ) ?? 0)
      : 0;

  // Reject if monthly limit reached
  if (monthlyCount >= MAX_NOTIFICATIONS_PER_MONTH) {
    // Report this event for analytics only once per month (fire-and-forget)
    const lastReportedMonth = readFromGlobalState<string>(
      context,
      GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH,
    );

    if (lastReportedMonth !== currentMonthKey) {
      // Mark that we've reported for this month BEFORE async call to prevent race condition
      writeToGlobalState(
        context,
        GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH,
        currentMonthKey,
      );

      const telemetryService = createTelemetryService();
      telemetryService
        .reportNotificationLimitReached(
          currentMonthKey,
          monthlyCount,
          MAX_NOTIFICATIONS_PER_MONTH,
        )
        .catch((err) =>
          console.warn('Failed to report notification limit reached:', err),
        );
    }

    return false;
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
 * Records that a notification was shown (updates last shown timestamp and monthly count)
 * Note: BYPASS priority notifications update timestamp but don't increment monthly counter
 */
export function recordNotificationShown(
  context: vscode.ExtensionContext,
  notificationEvent: NotificationEvent,
): void {
  // Update timestamp
  writeToGlobalState(
    context,
    GlobalStateKey.LAST_SHOWN_NOTIFICATION,
    Date.now(),
  );

  const priority = NOTIFICATION_PRIORITY_MAP[notificationEvent];

  // BYPASS notifications don't count against monthly limit
  if (priority === NotificationPriority.BYPASS) {
    return;
  }

  // Handle monthly counter with automatic reset on month change
  const currentMonthKey = getCurrentMonthKey();
  const storedMonthKey = readFromGlobalState<string>(
    context,
    GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
  );

  // If month changed, reset counter to 1, otherwise increment
  if (storedMonthKey !== currentMonthKey) {
    writeToGlobalState(context, GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 1);
  } else {
    const monthlyCount =
      readFromGlobalState<number>(
        context,
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      ) ?? 0;
    writeToGlobalState(
      context,
      GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      monthlyCount + 1,
    );
  }

  // Always update the month key
  writeToGlobalState(
    context,
    GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
    currentMonthKey,
  );
}

/**
 * Records a dismissal (either "Maybe Later" or X button click)
 * Increments consecutive dismissal counter and pauses notifications if threshold reached
 */
export function recordDismissal(context: vscode.ExtensionContext): void {
  const currentMonthKey = getCurrentMonthKey();
  const storedMonthKey = readFromGlobalState<string>(
    context,
    GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
  );

  // If month changed, reset dismissal counter to 0 before incrementing
  const currentCount =
    storedMonthKey === currentMonthKey
      ? (readFromGlobalState<number>(
          context,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
        ) ?? 0)
      : 0;

  const newCount = currentCount + 1;
  writeToGlobalState(
    context,
    GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
    newCount,
  );

  // Update dismissal tracking month key
  writeToGlobalState(
    context,
    GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
    currentMonthKey,
  );

  // Check if we've reached the threshold
  if (newCount >= MAX_CONSECUTIVE_DISMISSALS) {
    const pauseUntil = getEndOfMonthTimestamp();
    const currentMonthKey = getCurrentMonthKey();

    // Pause notifications until end of month
    writeToGlobalState(
      context,
      GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
      pauseUntil,
    );

    // Report to analytics only once per month (fire-and-forget)
    const lastReportedMonth = readFromGlobalState<string>(
      context,
      GlobalStateKey.PAUSE_REPORTED_FOR_MONTH,
    );

    if (lastReportedMonth !== currentMonthKey) {
      // Mark that we've reported for this month BEFORE async call to prevent race condition
      writeToGlobalState(
        context,
        GlobalStateKey.PAUSE_REPORTED_FOR_MONTH,
        currentMonthKey,
      );

      const telemetryService = createTelemetryService();
      telemetryService
        .reportNotificationsPaused(currentMonthKey, newCount, pauseUntil)
        .catch((err) =>
          console.warn('Failed to report notifications paused:', err),
        );

      console.log(
        `[Turbo Console Log] Notifications paused until end of month after ${newCount} consecutive dismissals`,
      );
    }
  }
}

/**
 * Resets the consecutive dismissal counter (called when user clicks CTA)
 */
export function resetDismissalCounter(context: vscode.ExtensionContext): void {
  writeToGlobalState(context, GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 0);
}

/**
 * Decrements the monthly notification counter (called when a variant is deactivated)
 * This allows us to "undo" the cooldown consumption for deactivated A/B test variants
 * Note: The timestamp remains set to prevent rapid re-attempts
 */
export function decrementMonthlyCounter(
  context: vscode.ExtensionContext,
  notificationEvent: NotificationEvent,
): void {
  const priority = NOTIFICATION_PRIORITY_MAP[notificationEvent];

  // BYPASS notifications don't count against monthly limit, nothing to decrement
  if (priority === NotificationPriority.BYPASS) {
    return;
  }

  const currentMonthKey = getCurrentMonthKey();
  const storedMonthKey = readFromGlobalState<string>(
    context,
    GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
  );

  // Only decrement if we're in the same month
  if (storedMonthKey === currentMonthKey) {
    const monthlyCount =
      readFromGlobalState<number>(
        context,
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      ) ?? 0;

    // Prevent going negative
    if (monthlyCount > 0) {
      writeToGlobalState(
        context,
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        monthlyCount - 1,
      );
    }
  }
}
