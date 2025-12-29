import * as vscode from 'vscode';
import { UserActivityStatus, GlobalStateKey } from '@/entities';
import { readFromGlobalState } from './readFromGlobalState';

export function getUserActivityStatus(
  context: vscode.ExtensionContext,
): UserActivityStatus | undefined {
  return readFromGlobalState<UserActivityStatus>(
    context,
    GlobalStateKey.USER_ACTIVITY_STATUS,
  );
}
