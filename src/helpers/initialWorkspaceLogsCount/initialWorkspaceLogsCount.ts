import vscode from 'vscode';
import path from 'path';
import { GitIgnoreMatcher } from './GitIgnoreMatcher';
import { collectFilesWithLogs } from './collectFilesWithLogs';
import { ExtensionProperties, Message, GlobalStateKey } from '@/entities';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Minimum log count threshold to trigger notification
 */
const LOG_COUNT_THRESHOLD = 100;

/**
 * Workspace log analytics metadata
 */
export type WorkspaceLogMetadata = {
  totalLogs: number;
  totalFiles: number;
  repositories: Array<{
    name: string;
    path: string;
    logCount: number;
    fileCount: number; // Files with logs in this repository
    topNestedFolder?: {
      relativePath: string; // e.g., "src/commands" or "lib/utils"
      logCount: number;
      percentage: number; // Percentage of repository's total logs
    };
  }>;
  logTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
};

export async function initialWorkspaceLogsCount(
  config: ExtensionProperties,
  launcherView: vscode.TreeView<string>,
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
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
  // Track repository-level data with per-repo insights
  const repositoryData: Array<{
    name: string;
    path: string;
    logCount: number;
    fileCount: number;
    topNestedFolder?: {
      relativePath: string;
      logCount: number;
      percentage: number;
    };
  }> = [];

  for (const folder of vscode.workspace.workspaceFolders) {
    try {
      const folderLogs = await collectFilesWithLogs(
        folder.uri.fsPath,
        config,
        gitIgnoreMatcher,
      );
      let folderLogCount = 0;
      const nestedFolderCounts: Map<string, number> = new Map();

      folderLogs.forEach((logs, filePath) => {
        filesLogsMap.set(filePath, logs);
        folderLogCount += logs.length;

        // Calculate nested folder hotspots for this repository
        const relativePath = path.relative(folder.uri.fsPath, filePath);
        const pathParts = relativePath.split(path.sep);

        // Extract nested folder (2-3 levels deep, excluding filename)
        if (pathParts.length >= 3) {
          const nestedFolder = pathParts
            .slice(0, Math.min(3, pathParts.length - 1))
            .join('/');
          const currentCount = nestedFolderCounts.get(nestedFolder) || 0;
          nestedFolderCounts.set(nestedFolder, currentCount + logs.length);
        }
      });

      // Find top nested folder for this repository
      let topNestedFolder:
        | {
            relativePath: string;
            logCount: number;
            percentage: number;
          }
        | undefined = undefined;

      if (nestedFolderCounts.size > 0) {
        const sortedNestedFolders = Array.from(
          nestedFolderCounts.entries(),
        ).sort((a, b) => b[1] - a[1]);
        const [topPath, topCount] = sortedNestedFolders[0];
        topNestedFolder = {
          relativePath: topPath,
          logCount: topCount,
          percentage: Math.round((topCount / folderLogCount) * 100),
        };
      }

      // Track repository metadata with per-repo insights
      repositoryData.push({
        name: path.basename(folder.uri.fsPath),
        path: folder.uri.fsPath,
        logCount: folderLogCount,
        fileCount: folderLogs.size,
        topNestedFolder,
      });
    } catch (error) {
      console.warn(
        `[initialWorkspaceLogsCount] Failed to collect logs from folder ${folder.uri.fsPath}:`,
        error,
      );
      // Skip this folder and continue with others
    }
  }

  // Calculate total logs and log type distribution
  let totalLogsCount = 0;
  const logTypeCounts: Map<string, number> = new Map();

  for (const [, logs] of filesLogsMap) {
    totalLogsCount += logs.length;

    // Count log types (console.log, console.warn, console.error, etc.)
    logs.forEach((message) => {
      const logFunction = message.logFunction || 'console.log';
      logTypeCounts.set(logFunction, (logTypeCounts.get(logFunction) || 0) + 1);
    });
  }

  // Build log type distribution with percentages using largest remainder method
  // This ensures percentages always sum to exactly 100%
  const logTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }> = (() => {
    if (totalLogsCount === 0) {
      return [];
    }

    // Calculate exact percentages and floor values
    const items = Array.from(logTypeCounts.entries()).map(([type, count]) => {
      const exactPercentage = (count / totalLogsCount) * 100;
      const flooredPercentage = Math.floor(exactPercentage);
      const remainder = exactPercentage - flooredPercentage;
      return { type, count, flooredPercentage, remainder };
    });

    // Calculate how many percentage points we need to distribute
    const totalFloored = items.reduce(
      (sum, item) => sum + item.flooredPercentage,
      0,
    );
    const remainingPoints = 100 - totalFloored;

    // Sort by remainder (descending) to distribute remaining points to items with largest fractional parts
    items.sort((a, b) => b.remainder - a.remainder);

    // Distribute remaining points
    const result = items.map((item, index) => ({
      type: item.type,
      count: item.count,
      percentage: item.flooredPercentage + (index < remainingPoints ? 1 : 0),
    }));

    // Sort by count (descending) for display
    return result.sort((a, b) => b.count - a.count);
  })();

  // Store workspace metadata in global state for panel access
  const metadata: WorkspaceLogMetadata = {
    totalLogs: totalLogsCount,
    totalFiles: filesLogsMap.size,
    repositories: repositoryData,
    logTypeDistribution,
  };

  writeToGlobalState(context, GlobalStateKey.WORKSPACE_LOG_METADATA, metadata);

  // Don't show badge if count is zero - wait for meaningful moment
  if (totalLogsCount === 0) {
    return;
  }

  // Always set badge regardless of notification status
  launcherView.badge = {
    value: totalLogsCount,
    tooltip: 'Total log statements in workspace',
  };

  // Check if we should trigger notification (one-time only)
  // Note: This function is only called for non-Pro users (see extension.ts activation)
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
  );
  if (hasShownNotification) {
    return;
  }

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
