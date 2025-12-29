import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';

/**
 * Tracks daily usage streak by comparing current date with last insertion date
 * Returns the current streak count
 * @param context VS Code extension context
 * @param currentDate Current date to compare against (for testability)
 * @returns Current streak count
 */
export function trackStreakDays(
  context: vscode.ExtensionContext,
  currentDate: Date = new Date(),
): number {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const todayTimestamp = today.getTime();

  const lastInsertionDate = readFromGlobalState<number>(
    context,
    GlobalStateKey.LAST_INSERTION_DATE,
  );
  let streakCount =
    readFromGlobalState<number>(context, GlobalStateKey.STREAK_COUNT) || 0;

  if (lastInsertionDate) {
    const lastDate = new Date(lastInsertionDate);
    lastDate.setHours(0, 0, 0, 0);
    const lastDateTimestamp = lastDate.getTime();

    const daysDifference = Math.floor(
      (todayTimestamp - lastDateTimestamp) / (1000 * 60 * 60 * 24),
    );

    if (daysDifference === 0) {
      // Same day - don't update streak count, wait for tomorrow
      // No action needed, return current streak
    } else if (daysDifference === 1) {
      // Consecutive day - increment streak
      streakCount++;
      writeToGlobalState(context, GlobalStateKey.STREAK_COUNT, streakCount);
    } else {
      // Streak broken - reset to 1
      streakCount = 1;
      writeToGlobalState(context, GlobalStateKey.STREAK_COUNT, streakCount);
    }
  } else {
    // First time tracking - initialize
    streakCount = 1;
    writeToGlobalState(context, GlobalStateKey.STREAK_COUNT, streakCount);
  }

  return streakCount;
}
