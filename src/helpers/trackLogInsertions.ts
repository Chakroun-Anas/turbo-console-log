import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';

/**
 * Tracks log insertion commands usage
 * v3.21.2: Disabled all PLG marketing milestone notifications
 * Only tracks usage count for internal metrics
 * @param context VS Code extension context
 */
export async function trackLogInsertions(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Increment command usage count (track for all users, including Pro)
  let commandUsageCount =
    readFromGlobalState<number>(context, GlobalStateKey.COMMAND_USAGE_COUNT) ||
    0;
  commandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.COMMAND_USAGE_COUNT,
    commandUsageCount,
  );

  // Update last insertion date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  writeToGlobalState(
    context,
    GlobalStateKey.LAST_INSERTION_DATE,
    today.getTime(),
  );

  // v3.21.2: All PLG marketing notifications removed
  // (multi-file logs, 10/20/50/100 insert milestones)
}
