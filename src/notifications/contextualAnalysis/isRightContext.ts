import { NotificationEvent } from '../NotificationEvent';
import {
  isReleaseAnnouncementContextRight,
  isWeekendTurboSundaysContextRight,
  isWorkspaceLogThresholdContextRight,
  isInactiveTwoWeeksReturnContextRight,
  isInactiveFourWeeksSurveyContextRight,
  isCommitWithLogsContextRight,
  isJSMessyFileContextRight,
  isJSMultiLogTypesContextRight,
} from './contexts';

/**
 * Evaluates if the current workspace context is suitable for showing a notification
 * Routes to event-specific scoring functions based on notification type
 *
 * @param notificationEvent The type of notification to evaluate
 * @returns true if context is favorable, false otherwise
 */
export function isRightContext(notificationEvent: NotificationEvent): boolean {
  // Route to event-specific context evaluators
  switch (notificationEvent) {
    case NotificationEvent.EXTENSION_RELEASE_ANNOUNCEMENT:
      return isReleaseAnnouncementContextRight();

    case NotificationEvent.EXTENSION_WEEKEND_TURBO_SUNDAYS:
      return isWeekendTurboSundaysContextRight();

    case NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD:
      return isWorkspaceLogThresholdContextRight();

    case NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY:
      return isInactiveFourWeeksSurveyContextRight();

    case NotificationEvent.EXTENSION_COMMIT_WITH_LOGS:
      return isCommitWithLogsContextRight();

    case NotificationEvent.EXTENSION_JS_MESSY_FILE:
      return isJSMessyFileContextRight();

    case NotificationEvent.EXTENSION_JS_MULTI_LOG_TYPES:
      return isJSMultiLogTypesContextRight();

    case NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN:
      return isInactiveTwoWeeksReturnContextRight();

    // Default: pass through for events without context scoring yet
    // As we implement more event-specific scoring, add cases here
    default:
      return true;
  }
}
