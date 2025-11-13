import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

/**
 * Tracks panel opening usage
 * Shows frequent panel access notification every 10 openings starting at 10
 * @param context VS Code extension context
 */
export function trackPanelOpenings(context: vscode.ExtensionContext): void {
  // Get extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Check if user has already subscribed to newsletter
  const hasSubscribedToNewsletter = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER,
  );

  // Skip notification if user already subscribed
  if (hasSubscribedToNewsletter) {
    return;
  }

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

  // Show notification every 10 openings (10, 20, 30, etc.)
  if (panelOpeningCount >= 10 && panelOpeningCount % 10 === 0) {
    // Show frequent panel access notification (non-blocking) with version info
    showNotification(
      NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
      version,
      context,
    );
  }
}
