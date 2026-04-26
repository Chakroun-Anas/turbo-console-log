import { NotificationEventHandler } from './notificationEventHandler';
import { inactiveTwoWeeksReturnHandler } from './listenToInactiveTwoWeeksReturn';
import { activationDaySevenHandler } from './listenToActivationDaySeven';

/**
 * All notification event handlers that trigger on file openings
 * Each handler is defined in its own file and follows the NotificationEventHandler interface
 * Add new handlers here to automatically include them in the master listener
 *
 * v3.21.2: Reduced to 2 core handlers (inactive two weeks return + activation day 7)
 * Removed 9 PLG marketing handlers to reduce notification fatigue
 */
export const allNotificationHandlers: NotificationEventHandler[] = [
  inactiveTwoWeeksReturnHandler,
  activationDaySevenHandler,
];
