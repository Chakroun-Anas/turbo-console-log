import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';

/**
 * Tracks panel opening usage
 * v3.21.2: Disabled panel frequent access notification
 * Only tracks usage count for internal metrics
 * @param context VS Code extension context
 */
export async function trackPanelOpenings(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Increment panel opening count
  let panelOpeningCount =
    readFromGlobalState<number>(context, GlobalStateKey.PANEL_OPENING_COUNT) ||
    0;
  panelOpeningCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.PANEL_OPENING_COUNT,
    panelOpeningCount,
  );

  // v3.21.2: Panel frequent access notification removed
}
