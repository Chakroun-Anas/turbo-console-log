import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState, isProUser } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

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
 * Checks if current active editor contains logging library usage
 * @param context VS Code extension context
 * @param version Extension version
 */
async function checkActiveEditor(
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const content = editor.document.getText();
  const detectedLibrary = detectLoggingLibrary(content);

  if (detectedLibrary) {
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
  }
}

/**
 * Listens to active text editor changes and detects custom logging library usage
 * Shows notification when popular logging libraries (winston, pino, monolog, etc.) are detected
 * Targets users already invested in logging with info about custom log function settings
 * One-time notification per user (free users only)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToCustomLogLibrary(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
  );

  if (hasShownNotification) {
    return;
  }

  // Check active editor on activation
  checkActiveEditor(context, version);

  // Listen to active text editor changes
  const disposable = vscode.window.onDidChangeActiveTextEditor(async () => {
    // Check if notification was shown (might have been triggered by previous check)
    const alreadyShown = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
    );

    if (alreadyShown) {
      disposable.dispose(); // Stop listening
      return;
    }

    await checkActiveEditor(context, version);
  });

  context.subscriptions.push(disposable);
}
