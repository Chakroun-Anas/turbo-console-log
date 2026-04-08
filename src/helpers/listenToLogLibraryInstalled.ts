import * as vscode from 'vscode';
import { readFromGlobalState, isProUser, writeToGlobalState } from './index';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';

// Popular logging libraries to detect
const LOGGING_LIBRARIES = [
  'winston',
  'pino',
  'bunyan',
  'log4js',
  'log4js-node',
  'consola',
  'signale',
  'roarr',
  'loglevel',
  'debug',
  'npmlog',
  'tracer',
  'morgan',
  'log',
  'fancy-log',
  'electron-log',
  '@sentry/node',
  '@sentry/browser',
  'logform',
  'triple-beam',
] as const;

/**
 * Listens to package.json changes and shows notification when logging library is installed
 * Targets users who install dedicated logging libraries (winston, pino, bunyan, etc.)
 * Promotes Turbo's custom log function feature for better integration
 * One-time notification per workspace (doesn't repeat after first detection)
 *
 * Design:
 * - Watches lock files (package-lock.json, pnpm-lock.yaml, yarn.lock) for changes
 * - Lock files are more reliably updated by package managers than package.json
 * - Detects changes from npm/pnpm/yarn installs
 * - Parses corresponding package.json to detect logging libraries
 * - Shows notification once when any logging library detected
 * - Stores permanent flag to prevent repeat notifications
 * - High conversion potential: user just installed logging library = high intent signal
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToLogLibraryInstalled(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users - they likely know about custom log functions
  if (isProUser(context)) {
    return;
  }

  // Check if notification was already shown (one-time event)
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, don't set up listener
  }

  // Track the current set of logging libraries to detect NEW additions
  let previousLoggingLibraries: Set<string> = new Set();

  // Initialize by reading current package.json files to establish baseline
  const initializeBaseline = async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    for (const folder of workspaceFolders) {
      try {
        const packageJsonUri = vscode.Uri.joinPath(folder.uri, 'package.json');
        const packageJsonBytes =
          await vscode.workspace.fs.readFile(packageJsonUri);
        const packageJsonText = Buffer.from(packageJsonBytes).toString('utf8');
        const packageJson = JSON.parse(packageJsonText);

        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};
        const peerDependencies = packageJson.peerDependencies || {};
        const optionalDependencies = packageJson.optionalDependencies || {};
        const allDependencies = {
          ...dependencies,
          ...devDependencies,
          ...peerDependencies,
          ...optionalDependencies,
        };

        // Track existing logging libraries
        LOGGING_LIBRARIES.forEach((lib) => {
          if (lib in allDependencies) {
            previousLoggingLibraries.add(lib);
          }
        });
      } catch (error) {
        console.error(
          'Failed to read package.json for log library detection:',
          error,
        );
      }
    }
  };

  // Initialize baseline before setting up watchers
  initializeBaseline();

  // Watch lock files for changes - more reliable than watching package.json
  // Lock files are ALWAYS modified when packages are installed (npm/pnpm/yarn)
  const watcher = vscode.workspace.createFileSystemWatcher(
    '**/{package-lock.json,pnpm-lock.yaml,yarn.lock}',
    false, // don't ignore creates (fresh npm install)
    false, // watch changes (package updates)
    true, // ignore deletes
  );

  // Handler for both onCreate and onChange events
  const handleLockFileChange = async (uri: vscode.Uri) => {
    // Double-check the flag (in case it was set by another instance)
    const alreadyShown = readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
    );

    if (alreadyShown) {
      // Dispose the watcher since we've already shown the notification
      watcher.dispose();
      return;
    }

    try {
      // Get the directory containing the lock file
      const lockFileDir = uri.fsPath.substring(0, uri.fsPath.lastIndexOf('/'));
      const packageJsonPath = vscode.Uri.file(`${lockFileDir}/package.json`);

      // Read and parse package.json
      const packageJsonBytes =
        await vscode.workspace.fs.readFile(packageJsonPath);
      const packageJsonText = Buffer.from(packageJsonBytes).toString('utf8');
      const packageJson = JSON.parse(packageJsonText);

      // Check all dependency types
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      const peerDependencies = packageJson.peerDependencies || {};
      const optionalDependencies = packageJson.optionalDependencies || {};
      const allDependencies = {
        ...dependencies,
        ...devDependencies,
        ...peerDependencies,
        ...optionalDependencies,
      };

      // Check if any logging library is installed
      const hasLoggingLibrary = LOGGING_LIBRARIES.some(
        (lib) => lib in allDependencies,
      );

      if (!hasLoggingLibrary) {
        return; // No logging library detected
      }

      // Build current set of logging libraries
      const currentLoggingLibraries = new Set<string>();
      LOGGING_LIBRARIES.forEach((lib) => {
        if (lib in allDependencies) {
          currentLoggingLibraries.add(lib);
        }
      });

      // Check if any NEW logging library was added (not in previous set)
      const newLibraries = [...currentLoggingLibraries].filter(
        (lib) => !previousLoggingLibraries.has(lib),
      );

      if (newLibraries.length === 0) {
        return; // No NEW logging libraries, just a regular dependency update
      }

      // Update the baseline with current libraries
      previousLoggingLibraries = currentLoggingLibraries;

      // Logging library detected! Show notification
      const notificationShown = await showNotification(
        NotificationEvent.EXTENSION_LOG_LIBRARY_INSTALLED,
        version,
        context,
      );

      // If notification was shown, set permanent flag and dispose watcher
      if (notificationShown) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
          true,
        );
        watcher.dispose();
      }
    } catch (error) {
      // JSON parsing error or other issue - silently fail
      // Don't want to disrupt user's workflow with error messages
      console.warn(
        'Failed to parse package.json for logging library detection:',
        error,
      );
    }
  };

  // Listen to both create (fresh installs) and change (package updates)
  const onCreateDisposable = watcher.onDidCreate(handleLockFileChange);
  const onChangeDisposable = watcher.onDidChange(handleLockFileChange);

  // Add watcher and disposables to subscriptions for cleanup
  context.subscriptions.push(watcher, onCreateDisposable, onChangeDisposable);
}
