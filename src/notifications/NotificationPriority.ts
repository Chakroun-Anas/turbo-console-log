import { NotificationEvent } from './NotificationEvent';

/**
 * Notification priority levels for cooldown management:
 * - BYPASS: Show immediately, ignoring cooldown period
 * - IGNORE: Don't show if in cooldown, don't queue (3-day cooldown applies)
 */
export enum NotificationPriority {
  BYPASS = 'bypass',
  IGNORE = 'ignore',
}

/**
 * Maps each notification event to its priority level
 */
export const NOTIFICATION_PRIORITY_MAP: Record<
  NotificationEvent,
  NotificationPriority
> = {
  // BYPASS: Critical notifications that should always show immediately
  [NotificationEvent.EXTENSION_FRESH_INSTALL]: NotificationPriority.BYPASS,
  [NotificationEvent.EXTENSION_PHP_PRO_ONLY]: NotificationPriority.BYPASS,
  [NotificationEvent.EXTENSION_RELEASE_ANNOUNCEMENT]:
    NotificationPriority.BYPASS,

  // IGNORE: Low-priority notifications that respect cooldown strictly
  [NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_THREE_DAY_STREAK]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_MULTI_FILE_LOGS]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_TEN_INSERTS]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_TWENTY_INSERTS]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIFTY_INSERTS]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_HUNDRED_INSERTS]: NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS]:
    NotificationPriority.IGNORE,
  [NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED]:
    NotificationPriority.IGNORE,
};

/**
 * Configuration constants for the cooldown system
 */
export const COOLDOWN_CONFIG = {
  /** Cooldown period in milliseconds (2 days) */
  COOLDOWN_PERIOD_MS: 2 * 24 * 60 * 60 * 1000,
};
