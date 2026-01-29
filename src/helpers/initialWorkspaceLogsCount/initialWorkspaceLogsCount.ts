import vscode from 'vscode';
import { GitIgnoreMatcher } from './GitIgnoreMatcher';
import { collectFilesWithLogs } from './collectFilesWithLogs';
import { ExtensionProperties, Message, GlobalStateKey } from '@/entities';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Minimum log count threshold to trigger notification
 */
const LOG_COUNT_THRESHOLD = 100;

export async function initialWorkspaceLogsCount(
  config: ExtensionProperties,
  launcherView: vscode.TreeView<string>,
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
  // Trigger notification if workspace has 100+ logs (one-time, free users only)
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
  );
  const isPro = isProUser(context);
  if (hasShownNotification || isPro) {
    return;
  }
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    // Don't show badge when no workspace is opened - wait for meaningful moment
    return;
  }

  const filesLogsMap = new Map<string, Array<Message>>();
  const gitIgnoreMatcher: GitIgnoreMatcher = new GitIgnoreMatcher();

  // Initialize gitignore matcher with error handling
  try {
    await gitIgnoreMatcher.init();
  } catch (error) {
    console.warn(
      '[initialWorkspaceLogsCount] Failed to initialize gitignore matcher:',
      error,
    );
    // Fail silently - without gitignore filtering we risk scanning node_modules
    // and potentially freezing the editor. Don't show error badge to preserve good UX.
    return;
  }

  // Collect logs from all workspace folders with error handling
  for (const folder of vscode.workspace.workspaceFolders) {
    try {
      const folderLogs = await collectFilesWithLogs(
        folder.uri.fsPath,
        config,
        gitIgnoreMatcher,
      );
      folderLogs.forEach((logs, filePath) => {
        filesLogsMap.set(filePath, logs);
      });
    } catch (error) {
      console.warn(
        `[initialWorkspaceLogsCount] Failed to collect logs from folder ${folder.uri.fsPath}:`,
        error,
      );
      // Skip this folder and continue with others
    }
  }

  let totalLogsCount = 0;
  for (const [, logs] of filesLogsMap) {
    totalLogsCount += logs.length;
  }

  // Don't show badge if count is zero - wait for meaningful moment
  if (totalLogsCount === 0) {
    return;
  }

  launcherView.badge = {
    value: totalLogsCount,
    tooltip: 'Total log statements in workspace',
  };

  if (totalLogsCount >= LOG_COUNT_THRESHOLD) {
    // Show notification with personalized log count
    // Note: Backend will replace {logCount} placeholder with actual count
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
      version,
      context,
      totalLogsCount,
    );
    if (wasShown) {
      // Mark notification as shown (prevent duplicates)
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    }
  }
}
