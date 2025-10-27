import type { ExtensionContext } from 'vscode';
import { GlobalStateKey } from '@/entities';
import { readFromGlobalState } from './readFromGlobalState';

/**
 * Determines if the current user is on a fresh install (new user) or an existing user
 * based on the extension version history.
 *
 * Prerequisites: Must be called AFTER traceExtensionVersionHistory() has run,
 * which ensures the version history array exists.
 *
 * Logic:
 * - Version history length === 1 → Fresh install (only current version installed)
 * - Version history length > 1 → Existing user (has upgraded at least once)
 *
 * This approach works independently of whether notifications were shown,
 * making it reliable for contextual notification systems.
 *
 * @param context - VS Code extension context
 * @returns true if user is on a fresh install, false if existing user
 */
export function isFreshInstall(context: ExtensionContext): boolean {
  // Read version history array (guaranteed to exist after traceExtensionVersionHistory)
  const versionHistory = readFromGlobalState<string[]>(
    context,
    GlobalStateKey.EXTENSION_VERSION_HISTORY,
  );

  // Fresh install: only one version in history
  // Existing user: multiple versions in history
  return versionHistory?.length === 1;
}
