import * as vscode from 'vscode';
import { UserActivityStatus, GlobalStateKey } from '@/entities';
import { readFromGlobalState } from './readFromGlobalState';
import { writeToGlobalState } from './writeToGlobalState';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function updateUserActivityStatus(
  context: vscode.ExtensionContext,
): UserActivityStatus {
  const lastInsertionDate = readFromGlobalState<number>(
    context,
    GlobalStateKey.LAST_INSERTION_DATE,
  );

  if (lastInsertionDate !== undefined) {
    // User has inserted logs before - check recency
    const daysSinceLastInsertion = Date.now() - lastInsertionDate;
    const status =
      daysSinceLastInsertion < ONE_WEEK_MS
        ? UserActivityStatus.ACTIVE
        : UserActivityStatus.INACTIVE;

    writeToGlobalState(context, GlobalStateKey.USER_ACTIVITY_STATUS, status);
    return status;
  }

  // User has never inserted logs - check activity check start date
  const activityCheckStartDate = readFromGlobalState<number>(
    context,
    GlobalStateKey.ACTIVITY_CHECK_START_DATE,
  );

  if (activityCheckStartDate === undefined) {
    // First time checking - set start date and mark as ACTIVE (new user grace period)
    writeToGlobalState(
      context,
      GlobalStateKey.ACTIVITY_CHECK_START_DATE,
      Date.now(),
    );
    writeToGlobalState(
      context,
      GlobalStateKey.USER_ACTIVITY_STATUS,
      UserActivityStatus.ACTIVE,
    );
    return UserActivityStatus.ACTIVE;
  }

  // Subsequent check - determine status based on time since start
  const daysSinceStart = Date.now() - activityCheckStartDate;
  const status =
    daysSinceStart < ONE_WEEK_MS
      ? UserActivityStatus.ACTIVE
      : UserActivityStatus.INACTIVE;

  writeToGlobalState(context, GlobalStateKey.USER_ACTIVITY_STATUS, status);
  return status;
}
