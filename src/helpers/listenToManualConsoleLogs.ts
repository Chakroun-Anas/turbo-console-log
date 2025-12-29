import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  getUserActivityStatus,
  isProUser,
  updateUserActivityStatus,
} from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';

/**
 * Listens to text document changes and detects manual console.log typing
 * Shows re-engagement notification when INACTIVE user manually types console.log
 * Targets dormant users at their pain point with immediate value proposition
 * One-time notification per user (free users only)
 *
 * @param context VS Code extension context
 */
export function listenToManualConsoleLogs(
  context: vscode.ExtensionContext,
): void {
  // Skip for Pro users - they already have access to all features
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown - if so, no need to listen
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, no need to set up listener
  }

  // Only target INACTIVE users - no need to listen for ACTIVE users
  const userActivityStatus = getUserActivityStatus(context);
  if (userActivityStatus === UserActivityStatus.ACTIVE) {
    return; // User is ACTIVE, skip listener setup
  }

  // Get extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Supported file extensions for console.log detection
  const supportedExtensions = [
    'ts',
    'js',
    'tsx',
    'jsx',
    'mjs',
    'cjs',
    'mts',
    'cts',
    'vue',
    'svelte',
    'astro',
  ];

  // Track lines that started empty and are being typed on
  // Only monitor these lines for console.log completion
  const trackedLines = new Set<string>();

  // Detect console.log pattern (with variations)
  // Must be at start of line (ignoring whitespace) and include opening parenthesis
  // This avoids matching comments or strings
  const consoleLogPattern = /^\s*console\.log\s*\(/i;

  // Listen to text document changes
  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    // Only process if there are content changes
    if (event.contentChanges.length === 0) {
      return;
    }

    // Filter by file type - only process supported file extensions
    const fileName = event.document.fileName;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedExtensions.includes(fileExtension)) {
      return;
    }

    // Update and check if user is INACTIVE
    // Recalculate status to catch users who just used Turbo (became ACTIVE)
    updateUserActivityStatus(context);
    const userActivityStatus = getUserActivityStatus(context);
    if (userActivityStatus === UserActivityStatus.ACTIVE) {
      // User became ACTIVE - dispose listener and stop monitoring
      disposable.dispose();
      return;
    }

    // Check each change for manual console.log typing
    for (const change of event.contentChanges) {
      const changedText = change.text;

      // Allow both pure additions and small replacements (autocomplete)
      // - Pure additions: rangeLength === 0 (manual typing)
      // - Autocomplete: rangeLength > 0 but small (e.g., "con" -> "console.log()")
      // Block large replacements/deletions (likely paste or refactoring)
      if (change.rangeLength > 20) {
        // Large replacement - likely not manual typing or autocomplete
        continue;
      }

      // Skip empty additions
      if (!changedText || changedText.length === 0) {
        continue;
      }

      // Skip large paste operations - allow autocomplete and manual typing
      // Autocomplete (like Tab completing "console.log()") is typically < 30 chars
      // Large code pastes are usually > 30 chars
      if (changedText.length > 50) {
        continue;
      }

      // Skip whitespace-only changes (Enter key, spaces, tabs)
      if (/^\s*$/.test(changedText)) {
        continue;
      }

      // Get the actual current line content from the document
      const lineNumber = change.range.start.line;
      const docUri = event.document.uri.toString();
      const lineKey = `${docUri}:${lineNumber}`;
      const currentLine = event.document.lineAt(lineNumber).text;

      // Check if line was empty before this change
      // Simple approach: if we're at the start of the line and the current line is just the changed text
      const wasEmpty =
        change.range.start.character === 0 &&
        currentLine.trim() === changedText.trim();

      // Start tracking lines that were empty and just got their first character
      if (wasEmpty && !trackedLines.has(lineKey)) {
        trackedLines.add(lineKey);
      }

      // Only check for console.log on lines we're actively tracking
      if (trackedLines.has(lineKey)) {
        const hasConsoleLogNow = consoleLogPattern.test(currentLine);
        if (hasConsoleLogNow) {
          // Stop tracking this line
          trackedLines.delete(lineKey);

          // User manually typed console.log - show re-engagement notification
          showNotification(
            NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG,
            version ?? '',
            context,
          ).then((wasShown) => {
            // Only mark as shown if it was actually displayed (not blocked by cooldown)
            if (wasShown) {
              writeToGlobalState(
                context,
                GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION,
                true,
              );
              // Dispose the listener - no need to monitor changes anymore
              disposable.dispose();
            }
          });
          // Found match, no need to check other changes
          return;
        }
      }

      // Clean up old entries to prevent memory leak (keep last 100 tracked lines)
      if (trackedLines.size > 100) {
        const firstKey = trackedLines.values().next().value;
        if (firstKey) {
          trackedLines.delete(firstKey);
        }
      }
    }
  });

  // Add to subscriptions for cleanup
  context.subscriptions.push(disposable);
}
