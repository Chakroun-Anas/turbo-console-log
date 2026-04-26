import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';

export type LogManagementCommandType =
  | 'comment'
  | 'uncomment'
  | 'delete'
  | 'correct';

/**
 * Tracks log management commands usage (comment, uncomment, delete, correct)
 * v3.21.2: Disabled all milestone notifications
 * Only tracks usage counts for internal metrics
 * @param context VS Code extension context
 * @param commandType Type of command being tracked
 */
export async function trackLogManagementCommands(
  context: vscode.ExtensionContext,
  commandType: LogManagementCommandType,
): Promise<void> {
  // Increment log management command usage count (track for all users, including Pro)
  let logManagementCommandUsageCount =
    readFromGlobalState<number>(
      context,
      GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
    ) || 0;
  logManagementCommandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
    logManagementCommandUsageCount,
  );

  const commandTypeMapping = {
    comment: {
      countKey: GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT,
    },
    uncomment: {
      countKey: GlobalStateKey.UNCOMMENT_COMMAND_USAGE_COUNT,
    },
    correct: {
      countKey: GlobalStateKey.CORRECTION_COMMAND_USAGE_COUNT,
    },
    delete: {
      countKey: GlobalStateKey.DELETE_COMMAND_USAGE_COUNT,
    },
  };

  const mapping = commandTypeMapping[commandType];
  let commandTypeCount =
    readFromGlobalState<number>(context, mapping.countKey) || 0;
  commandTypeCount++;
  writeToGlobalState(context, mapping.countKey, commandTypeCount);

  // v3.21.2: All command milestone notifications removed
}
