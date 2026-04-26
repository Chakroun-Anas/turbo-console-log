export enum NotificationEvent {
  // Bypass notifications cooldown period
  EXTENSION_FRESH_INSTALL = 'extensionFreshInstall',
  EXTENSION_PHP_PRO_ONLY = 'extensionPhpProOnly',
  EXTENSION_RELEASE_ANNOUNCEMENT = 'extensionReleaseAnnouncement',
  // Ignore notifications if in cooldown period
  EXTENSION_INACTIVE_MANUAL_LOG = 'extensionInactiveManualLog',
  EXTENSION_ACTIVATION_DAY_SEVEN = 'extensionActivationDaySeven',
  EXTENSION_INACTIVE_TWO_WEEKS_RETURN = 'extensionInactiveTwoWeeksReturn',
}
