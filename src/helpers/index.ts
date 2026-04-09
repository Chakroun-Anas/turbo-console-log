import { readFromGlobalState } from './readFromGlobalState';
import { writeToGlobalState } from './writeToGlobalState';
import { GlobalStateKeys } from './GlobalStateKeys';
import { getExtensionProperties } from './getExtensionProperties';
import { activateFreemiumLauncherMode } from './activateFreemiumLauncherMode';
import { activateFreemiumMode } from './activeFreemiumMode';
import { activateRepairMode } from './activateRepairMode';
import { activateProMode } from './activateProMode';
import { deactivateRepairMode } from './deactivateRepairMode';
import { trackLogInsertions } from './trackLogInsertions';
import { trackLogManagementCommands } from './trackLogManagementCommands';
import { isProUser } from './isProUser';
import { isPhpFile } from './isPhpFile';
import { isJavaScriptOrTypeScriptFile } from './isJavaScriptOrTypeScriptFile';
import { canInsertLogInDocument } from './canInsertLogInDocument';
import { traceExtensionVersionHistory } from './traceExtensionVersionHistory';
import { isFreshInstall } from './isFreshInstall';
import { listenToWeekendTurboSundays } from './listenToWeekendTurboSundays';
import { listenToCommitWithLogs } from './listenToCommitWithLogs';
import { listenToLogLibraryInstalled } from './listenToLogLibraryInstalled';
import { loadPhpDebugMessage } from './loadPhpDebugMessage';
import { showReleaseWebView } from './showReleaseWebView';
import { showReleaseNotification } from './showReleaseNotification';
import { updateUserActivityStatus } from './updateUserActivityStatus';
import { getUserActivityStatus } from './getUserActivityStatus';
import { listenToManualConsoleLogs } from './listenToManualConsoleLogs';
import { initialWorkspaceLogsCount } from './initialWorkspaceLogsCount/initialWorkspaceLogsCount';
import { listenToFileOpeningNotifications } from './listenToFileOpeningNotifications';
import { allNotificationHandlers } from './notificationHandlers';
import { setupNotificationListeners } from './setupNotificationListeners';

// Export individual handlers for potential standalone use
export { customLogLibraryHandler } from './listenToCustomLogLibrary';

export {
  readFromGlobalState,
  writeToGlobalState,
  GlobalStateKeys,
  getExtensionProperties,
  activateFreemiumLauncherMode,
  activateFreemiumMode,
  activateProMode,
  activateRepairMode,
  deactivateRepairMode,
  trackLogInsertions,
  trackLogManagementCommands,
  isProUser,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
  canInsertLogInDocument,
  traceExtensionVersionHistory,
  isFreshInstall,
  listenToWeekendTurboSundays,
  listenToCommitWithLogs,
  listenToLogLibraryInstalled,
  loadPhpDebugMessage,
  showReleaseWebView,
  showReleaseNotification,
  updateUserActivityStatus,
  getUserActivityStatus,
  listenToManualConsoleLogs,
  initialWorkspaceLogsCount,
  listenToFileOpeningNotifications,
  allNotificationHandlers,
  setupNotificationListeners,
};
