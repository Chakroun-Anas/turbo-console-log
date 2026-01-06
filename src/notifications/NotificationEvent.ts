export enum NotificationEvent {
  // Bypass notifications cooldown period
  EXTENSION_FRESH_INSTALL = 'extensionFreshInstall',
  EXTENSION_PHP_PRO_ONLY = 'extensionPhpProOnly',
  EXTENSION_RELEASE_ANNOUNCEMENT = 'extensionReleaseAnnouncement',
  // Ignore notifications if in cooldown period
  EXTENSION_THREE_DAY_STREAK = 'extensionThreeDayStreak',
  EXTENSION_MULTI_FILE_LOGS = 'extensionMultiFileLogs',
  EXTENSION_TEN_INSERTS = 'extensionTenInserts',
  EXTENSION_TWENTY_INSERTS = 'extensionTwentyInserts',
  EXTENSION_FIFTY_INSERTS = 'extensionFiftyInserts',
  EXTENSION_HUNDRED_INSERTS = 'extensionHundredInserts',
  EXTENSION_PANEL_FREQUENT_ACCESS = 'extensionPanelFrequentAccess',
  EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS = 'extensionFiveLogManagementCommands',
  EXTENSION_FIVE_COMMENTS_COMMANDS = 'extensionFiveCommentsCommands',
  EXTENSION_FIVE_UNCOMMENTS_COMMANDS = 'extensionFiveUncommentsCommands',
  EXTENSION_FIVE_CORRECTIONS_COMMANDS = 'extensionFiveCorrectionsCommands',
  EXTENSION_FIVE_DELETE_COMMANDS = 'extensionFiveDeleteCommands',
  EXTENSION_PHP_WORKSPACE_DETECTED = 'extensionPhpWorkspaceDetected',
  EXTENSION_INACTIVE_MANUAL_LOG = 'extensionInactiveManualLog',
}
