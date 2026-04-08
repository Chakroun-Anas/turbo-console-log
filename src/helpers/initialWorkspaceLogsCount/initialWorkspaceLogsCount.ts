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
const WORKSPACE_LOG_COUNT_THRESHOLD = 1000;

/**
 * Minimum commented log count threshold to trigger notification
 * Set to 50 as practical sweet spot - catches significant patterns without being too restrictive
 * Balances signal quality (real workflow issue) with reach (catches before becoming massive)
 */
const WORKSPACE_COMMENTED_LOG_THRESHOLD = 50;

/**
 * Minimum duplicate log count threshold to trigger notification
 * Consecutive duplicates are always a code smell indicating copy-paste mistakes or debugging artifacts
 * Set to 1 because even a single duplicate group warrants immediate attention
 */
const WORKSPACE_DUPLICATE_LOGS_THRESHOLD = 1;

/**
 * Minimum log count in a single nested folder to trigger hot folder notification
 * High log concentration in one folder indicates architectural issues and navigation challenges
 * Set to 100 as it represents significant complexity warranting attention
 */
const WORKSPACE_HOT_FOLDER_THRESHOLD = 100;

/**
 * Workspace log analytics metadata
 */
export type WorkspaceLogMetadata = {
  totalLogs: number;
  totalFiles: number;
  totalCommentedLogs: number;
  commentedLogsPercentage: number;
  totalDuplicateLogs: number;
  duplicateGroupsCount: number;
  duplicateLogsPercentage: number;
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
  let totalCommentedLogsCount = 0;
  let totalDuplicateLogsCount = 0;
  let duplicateGroupsCount = 0;
  const logTypeCounts: Map<string, number> = new Map();

  for (const [, logs] of filesLogsMap) {
    totalLogsCount += logs.length;

    // Count log types (console.log, console.warn, console.error, etc.)
    logs.forEach((message) => {
      const logFunction = message.logFunction || 'console.log';
      logTypeCounts.set(logFunction, (logTypeCounts.get(logFunction) || 0) + 1);

      // Count commented logs
      if (message.isCommented) {
        totalCommentedLogsCount++;
      }
    });

    // Detect consecutive duplicate logs within each file
    // A duplicate is defined as having the same content in consecutive lines
    for (let i = 0; i < logs.length - 1; i++) {
      const currentLog = logs[i];
      const nextLog = logs[i + 1];

      // Check if logs are actually on consecutive lines in the file
      // VS Code Range has exclusive end, so if currentLog.end.line === nextLog.start.line, they're consecutive
      const currentLogEndLine =
        currentLog.lines[currentLog.lines.length - 1].end.line;
      const nextLogStartLine = nextLog.lines[0].start.line;
      const areConsecutiveLines = nextLogStartLine === currentLogEndLine;

      // Compare normalized content (trimmed to handle whitespace variations)
      // AND ensure they are actually on consecutive lines
      if (
        currentLog.content &&
        nextLog.content &&
        currentLog.content === nextLog.content &&
        areConsecutiveLines
      ) {
        // Start of a new duplicate group?
        const isStartOfGroup =
          i === 0 || logs[i - 1]?.content !== currentLog.content;
        if (isStartOfGroup) {
          duplicateGroupsCount++;
          // Count the first log in the group
          totalDuplicateLogsCount++;
        }
        // Always count the next log (even if it continues a group)
        totalDuplicateLogsCount++;
      }
    }
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

  // Calculate commented logs percentage
  const commentedLogsPercentage =
    totalLogsCount > 0
      ? Math.round((totalCommentedLogsCount / totalLogsCount) * 100)
      : 0;

  // Calculate duplicate logs percentage
  const duplicateLogsPercentage =
    totalLogsCount > 0
      ? Math.round((totalDuplicateLogsCount / totalLogsCount) * 100)
      : 0;

  // Store workspace metadata in global state for panel access
  const metadata: WorkspaceLogMetadata = {
    totalLogs: totalLogsCount,
    totalFiles: filesLogsMap.size,
    totalCommentedLogs: totalCommentedLogsCount,
    commentedLogsPercentage,
    totalDuplicateLogs: totalDuplicateLogsCount,
    duplicateGroupsCount,
    duplicateLogsPercentage,
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

  // Check all notification triggers independently (each one-time only)
  // Note: This function is only called for non-Pro users (see extension.ts activation)

  // 1. Workspace log threshold notification (1000+ logs)
  const hasShownLogThresholdNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
  );
  if (
    !hasShownLogThresholdNotification &&
    totalLogsCount >= WORKSPACE_LOG_COUNT_THRESHOLD
  ) {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
      version,
      context,
      totalLogsCount,
    );
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    }
  }

  // 2. Commented logs notification (50+ commented logs)
  const hasShownCommentedLogsNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
  );
  if (
    !hasShownCommentedLogsNotification &&
    totalCommentedLogsCount >= WORKSPACE_COMMENTED_LOG_THRESHOLD
  ) {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
      version,
      context,
      totalCommentedLogsCount,
    );
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
        true,
      );
    }
  }

  // 3. Duplicate logs notification (1+ duplicate groups)
  const hasShownDuplicateLogsNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_DUPLICATE_LOGS_NOTIFICATION,
  );
  if (
    !hasShownDuplicateLogsNotification &&
    duplicateGroupsCount >= WORKSPACE_DUPLICATE_LOGS_THRESHOLD
  ) {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
      version,
      context,
      duplicateGroupsCount,
    );
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_DUPLICATE_LOGS_NOTIFICATION,
        true,
      );
    }
  }

  // 4. Hot folder notification (100+ logs in single nested folder)
  // Find the hottest folder across all repositories
  const hasShownHotFolderNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION,
  );
  if (!hasShownHotFolderNotification) {
    // Find the repository with the highest log concentration in a single folder
    let hottestFolder: {
      repoName: string;
      folderPath: string;
      logCount: number;
    } | null = null;

    for (const repo of repositoryData) {
      if (
        repo.topNestedFolder &&
        repo.topNestedFolder.logCount >= WORKSPACE_HOT_FOLDER_THRESHOLD
      ) {
        if (
          !hottestFolder ||
          repo.topNestedFolder.logCount > hottestFolder.logCount
        ) {
          hottestFolder = {
            repoName: repo.name,
            folderPath: repo.topNestedFolder.relativePath,
            logCount: repo.topNestedFolder.logCount,
          };
        }
      }
    }

    if (hottestFolder) {
      const wasShown = await showNotification(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        hottestFolder.logCount,
        `${hottestFolder.repoName}/${hottestFolder.folderPath}`,
      );
      if (wasShown) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION,
          true,
        );
      }
    }
  }
}
