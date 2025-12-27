import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '../notifications/showNotification';
import { NotificationEvent } from '../notifications/NotificationEvent';

/**
 * Tracks panel opening usage
 * Shows frequent panel access notification at 15 openings (sweet spot for engagement)
 * Uses >= check to handle cooldown blocking gracefully
 * Note: Uses IGNORE priority, so may be blocked by cooldown
 * @param context VS Code extension context
 */
export async function trackPanelOpenings(
  context: vscode.ExtensionContext,
): Promise<void> {
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

  // Check if notification already shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION,
  );

  // Skip if notification already shown
  if (hasShownNotification) {
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

  // Show notification at 15 panel openings (optimal engagement point)
  if (panelOpeningCount >= 15) {
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
      version,
      context,
    );

    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION,
        true,
      );
    }
  }
}
