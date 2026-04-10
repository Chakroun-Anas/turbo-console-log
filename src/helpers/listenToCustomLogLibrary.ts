import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { NotificationEventHandler } from './notificationEventHandler';

/**
 * Popular logging libraries to detect
 */
const LOGGING_LIBRARIES = {
  // JavaScript/TypeScript
  winston: /(?:from\s+['"]winston['"]|require\s*\(\s*['"]winston['"]\s*\))/,
  pino: /(?:from\s+['"]pino['"]|require\s*\(\s*['"]pino['"]\s*\))/,
  bunyan: /(?:from\s+['"]bunyan['"]|require\s*\(\s*['"]bunyan['"]\s*\))/,
  loglevel: /(?:from\s+['"]loglevel['"]|require\s*\(\s*['"]loglevel['"]\s*\))/,
  debug: /(?:from\s+['"]debug['"]|require\s*\(\s*['"]debug['"]\s*\))/,
  log4js: /(?:from\s+['"]log4js['"]|require\s*\(\s*['"]log4js['"]\s*\))/,
  signale: /(?:from\s+['"]signale['"]|require\s*\(\s*['"]signale['"]\s*\))/,

  // PHP
  monolog: /(?:use\s+Monolog\\|new\s+Monolog\\Logger)/,

  // Python
  pythonLogging: /(?:^|\n)\s*import\s+logging(?:\s|$)|(?:^|\n)\s*from\s+logging\s+import\s+/m,
  loguru: /(?:^|\n)\s*(?:import\s+loguru|from\s+loguru\s+import\s+)/m,
  structlog: /(?:^|\n)\s*(?:import\s+structlog|from\s+structlog\s+import\s+)/m,
};

/**
 * Detects if file content contains popular logging library imports
 * @param content File text content
 * @returns Detected library name or null
 */
function detectLoggingLibrary(content: string): string | null {
  for (const [libraryName, pattern] of Object.entries(LOGGING_LIBRARIES)) {
    if (pattern.test(content)) {
      return libraryName;
    }
  }
  return null;
}
/**
 * Custom log library detection handler for the new notification system
 * Detects popular logging libraries (winston, pino, monolog, etc.) in active file
 * Shows one-time notification to free users about custom log function settings
 */
export const customLogLibraryHandler: NotificationEventHandler = {
  id: 'customLogLibrary',

  shouldRegister(context: vscode.ExtensionContext): boolean {
    // Skip for Pro users
    if (isProUser(context)) {
      return false;
    }

    // Skip if notification has already been shown
    const hasShownNotification = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
    );

    return !hasShownNotification;
  },

  shouldProcess(editor: vscode.TextEditor | undefined): boolean {
    if (!editor) {
      return false;
    }

    // Check if file contains logging library usage
    const content = editor.document.getText();
    const detectedLibrary = detectLoggingLibrary(content);

    return detectedLibrary !== null;
  },

  async process(
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ): Promise<boolean> {
    // Show notification
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_CUSTOM_LOG_LIBRARY,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
        true,
      );
    }

    return wasShown;
  },
};
