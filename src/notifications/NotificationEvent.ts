export enum NotificationEvent {
  // Bypass notifications cooldown period
  EXTENSION_FRESH_INSTALL = 'extensionFreshInstall',
  EXTENSION_PHP_PRO_ONLY = 'extensionPhpProOnly',
  EXTENSION_TEN_INSERTS = 'extensionTenInserts',
  EXTENSION_FIFTY_INSERTS = 'extensionFiftyInserts',
  EXTENSION_PANEL_FREQUENT_ACCESS = 'extensionPanelFrequentAccess',
  EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS = 'extensionFiveLogManagementCommands',
  // Ignore notifications if in cooldown period
  EXTENSION_FIVE_COMMENTS_COMMANDS = 'extensionFiveCommentsCommands',
  EXTENSION_FIVE_UNCOMMENTS_COMMANDS = 'extensionFiveUncommentsCommands',
  EXTENSION_FIVE_CORRECTIONS_COMMANDS = 'extensionFiveCorrectionsCommands',
  EXTENSION_FIVE_DELETE_COMMANDS = 'extensionFiveDeleteCommands',
  EXTENSION_PHP_WORKSPACE_DETECTED = 'extensionPhpWorkspaceDetected',
}
