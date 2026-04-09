import { NotificationEventHandler } from './notificationEventHandler';

// Import all individual handlers from their respective files
import { jsMultiLogTypesHandler } from './listenToJSMultiLogTypes';
import { jsMessyFileHandler } from './listenToJSMessyFileDetection';
import { phpFileOpeningsHandler } from './listenToPhpFileOpenings';
import { phpMessyFileHandler } from './listenToPhpMessyFileDetection';
import { phpMultiLogTypesHandler } from './listenToPhpMultiLogTypes';
import { activityDropHandler } from './listenToActivityDrop';
import { inactiveTwoWeeksReturnHandler } from './listenToInactiveTwoWeeksReturn';
import { activationDayThreeHandler } from './listenToActivationDayThree';
import { activationDaySevenHandler } from './listenToActivationDaySeven';
import { logsInTestFileHandler } from './listenToLogsInTestFile';
import { customLogLibraryHandler } from './listenToCustomLogLibrary';

/**
 * All notification event handlers that trigger on file openings
 * Each handler is defined in its own file and follows the NotificationEventHandler interface
 * Add new handlers here to automatically include them in the master listener
 */
export const allNotificationHandlers: NotificationEventHandler[] = [
  jsMultiLogTypesHandler,
  jsMessyFileHandler,
  phpFileOpeningsHandler,
  phpMessyFileHandler,
  phpMultiLogTypesHandler,
  activityDropHandler,
  inactiveTwoWeeksReturnHandler,
  activationDayThreeHandler,
  activationDaySevenHandler,
  logsInTestFileHandler,
  customLogLibraryHandler,
];
