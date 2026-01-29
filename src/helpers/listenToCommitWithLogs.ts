import * as vscode from 'vscode';
import {
  readFromGlobalState,
  writeToGlobalState,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
  getExtensionProperties,
  isProUser,
} from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Git extension API types
 */
interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
  onDidOpenRepository: vscode.Event<Repository>;
}

interface Repository {
  state: RepositoryState;
  inputBox: { value: string };
  diffIndexWithHEAD(path: string): Promise<string>;
}

interface RepositoryState {
  onDidChange: vscode.Event<void>;
  indexChanges: Change[];
  workingTreeChanges: Change[];
}

interface Change {
  uri: vscode.Uri;
  status: number;
  originalUri?: vscode.Uri;
}

/**
 * Listens to Git commits and detects when user commits code containing console logs
 * Shows notification when free user commits with logs (PLG engagement at commit moment)
 * One-time notification per user (free users only)
 *
 * @param context VS Code extension context
 * @param version Extension version
 */
export function listenToCommitWithLogs(
  context: vscode.ExtensionContext,
  version: string,
): void {
  // Skip for Pro users - they already have advanced log management features
  if (isProUser(context)) {
    return;
  }

  // Check if notification has already been shown BEFORE setting up listener
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_COMMIT_WITH_LOGS_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, no need to listen
  }

  // Get extension properties for log detection config
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties = getExtensionProperties(config);

  // Get Git extension API
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  if (!gitExtension) {
    return; // Git extension not available
  }

  const git = gitExtension.getAPI(1);

  /**
   * Checks if the staged changes in a file contain console logs
   * Only looks at added lines (not the entire file)
   */
  async function commitChangesContainLogs(
    repository: Repository,
    uri: vscode.Uri,
  ): Promise<boolean> {
    try {
      const document = await vscode.workspace.openTextDocument(uri);

      // Check file type
      const isJS = isJavaScriptOrTypeScriptFile(document);
      const isPHP = isPhpFile(document);

      if (!isJS && !isPHP) {
        return false; // Skip unsupported file types
      }

      // Get the diff for this file (staged changes vs HEAD)
      const diff = await repository.diffIndexWithHEAD(uri.fsPath);

      if (!diff) {
        return false;
      }

      // Extract added lines from diff (lines starting with +, but not +++)
      // Diff format: lines starting with + are additions
      const addedLines = diff
        .split('\n')
        .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
        .map((line) => line.substring(1)); // Remove the leading +

      if (addedLines.length === 0) {
        return false; // No additions in this commit
      }

      // Define log patterns for JS/TS and PHP
      const jsLogPatterns = [
        /console\.(log|debug|info|warn|error|table|trace|dir|group|groupEnd)\s*\(/,
        new RegExp(
          `${extensionProperties.logFunction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`,
        ),
      ];

      const phpLogPatterns = [
        /error_log\s*\(/,
        /var_dump\s*\(/,
        /print_r\s*\(/,
        /var_export\s*\(/,
        /dump\s*\(/,
        /dd\s*\(/,
      ];

      const patterns = isJS ? jsLogPatterns : phpLogPatterns;

      // Check if any added line contains a log statement
      return addedLines.some((line) =>
        patterns.some((pattern) => pattern.test(line)),
      );
    } catch {
      // File might not exist, couldn't be opened, or diff failed
      return false;
    }
  }

  /**
   * Monitors a repository for commits
   */
  function monitorRepository(repository: Repository): void {
    let previousIndexChanges: Change[] = [];
    // Track which staged files contain log changes (checked while staged, before commit)
    const filesWithLogChanges = new Set<string>();

    // Track repository state changes
    const disposable = repository.state.onDidChange(async () => {
      const currentIndexChanges = repository.state.indexChanges;
      const currentWorkingTreeChanges = repository.state.workingTreeChanges;

      // Only analyze when working tree is clean (all changes are staged)
      // This is typically right before a commit and gives us a clean checkpoint
      const workingTreeIsClean = currentWorkingTreeChanges.length === 0;
      const hasStagedFiles = currentIndexChanges.length > 0;

      if (workingTreeIsClean && hasStagedFiles) {
        // Check all staged files for log changes
        for (const change of currentIndexChanges) {
          const filePath = change.uri.fsPath;

          // Check if this staged file's changes contain logs
          const changesContainLogs = await commitChangesContainLogs(
            repository,
            change.uri,
          );
          // Update the set based on current state
          if (changesContainLogs) {
            filesWithLogChanges.add(filePath);
          } else {
            filesWithLogChanges.delete(filePath);
          }
        }
      }

      // Detect when staged changes disappear (likely a commit happened)
      // This is a heuristic: when files move from staged to committed
      const hadStagedChanges = previousIndexChanges.length > 0;
      const nowHasNoStagedChanges = currentIndexChanges.length === 0;
      const potentialCommit = hadStagedChanges && nowHasNoStagedChanges;

      if (potentialCommit) {
        // Check if any of the committed files had log changes (tracked before commit)
        const committedFilesWithLogs = previousIndexChanges.some((change) =>
          filesWithLogChanges.has(change.uri.fsPath),
        );

        if (committedFilesWithLogs) {
          // Show notification
          const wasShown = await showNotification(
            NotificationEvent.EXTENSION_COMMIT_WITH_LOGS,
            version,
            context,
          );

          // Only mark as shown if it was actually displayed (not blocked by cooldown)
          if (wasShown) {
            writeToGlobalState(
              context,
              GlobalStateKey.HAS_SHOWN_COMMIT_WITH_LOGS_NOTIFICATION,
              true,
            );
            disposable.dispose(); // Stop listening once notification shown
          }
        }

        // Clear tracking for committed files (whether they had logs or not)
        for (const change of previousIndexChanges) {
          filesWithLogChanges.delete(change.uri.fsPath);
        }
      }

      // Update previous state for next iteration
      previousIndexChanges = [...currentIndexChanges];
    });

    // Add to subscriptions for cleanup
    context.subscriptions.push(disposable);
  }

  // Monitor all existing repositories
  for (const repository of git.repositories) {
    monitorRepository(repository);
  }

  // Monitor newly opened repositories
  const repoDisposable = git.onDidOpenRepository((repository) => {
    monitorRepository(repository);
  });

  context.subscriptions.push(repoDisposable);
}
