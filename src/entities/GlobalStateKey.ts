/**
 * Global state keys used throughout the extension
 * Centralized to avoid hardcoding strings and prevent typos
 */
export enum GlobalStateKey {
  // User lifecycle tracking
  IS_NEW_USER = 'IS_NEW_USER',
  EXTENSION_VERSION_HISTORY = 'EXTENSION_VERSION_HISTORY',

  // Release notification tracking
  IS_NOTIFICATION_SHOWN_PREFIX = 'IS_NOTIFICATION_SHOWN_',

  // Pro bundle management
  LICENSE_KEY = 'license-key',
  PRO_BUNDLE = 'pro-bundle',
  PRO_BUNDLE_VERSION = 'version',

  // User journey tracking
  COMMAND_USAGE_COUNT = 'COMMAND_USAGE_COUNT',
  HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION = 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
}
