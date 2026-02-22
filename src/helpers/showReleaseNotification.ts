import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications';
import { NotificationEvent } from '@/notifications/NotificationEvent';

/**
 * Shows release announcement notification for bi-weekly releases
 * Only shows once per version using global state tracking
 * Bypasses cooldown system for critical release announcements
 * @param context VS Code extension context
 * @param version Current extension version
 */
export async function showReleaseNotification(
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
  // Check if release notification has already been shown for this version
  const stateKey = `${GlobalStateKey.HAS_SHOWN_RELEASE_NOTIFICATION}${version}`;
  const hasShownNotification = readFromGlobalState<boolean>(context, stateKey);

  if (hasShownNotification) return;

  // Define versions that should trigger release announcements
  const releaseAnnouncementVersions = [
    '3.13.0', // New features announcement
    // Add future versions here
    '3.15.0', // Git integration announcement,
    '3.16.1', // Logs count announcement
    '3.17.0', // Smarter notifications timing
  ];

  // Only show notification for specific versions
  if (!releaseAnnouncementVersions.includes(version)) return;
  const wasShown = await showNotification(
    NotificationEvent.EXTENSION_RELEASE_ANNOUNCEMENT,
    version,
    context,
  );
  if (wasShown) {
    writeToGlobalState(context, stateKey, true);
  }
}
