import * as vscode from 'vscode';
import { readFromGlobalState } from './readFromGlobalState';
import { writeToGlobalState } from './writeToGlobalState';
import { GlobalStateKey } from '@/entities';

export const RELEASE_PANEL_VERSIONS = ['3.27.0'];

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Purely local decision — no backend round-trip. The panel is re-shown once
// per version whenever the local guard is missing (fresh install, lost/reset
// state, reinstall). Revealing the panel re-writes the guard (TurboReleasePanel),
// so this self-heals without needing the server to assert "already shown".
//
// Also auto-expires 3 days after this user's first exposure to a version's
// release panel (mirrors the pattern in updateUserActivityStatus.ts). Without
// this, a user who never opens or dismisses the panel would have it hijack
// the freemium/Pro panels (isNewRelease hides both, per package.json's `when`
// clauses) on every activation indefinitely.
export async function shouldShowReleasePanel(
  context: vscode.ExtensionContext,
  version: string,
): Promise<boolean> {
  if (!RELEASE_PANEL_VERSIONS.includes(version)) return false;

  const shownStateKey = `${GlobalStateKey.HAS_SHOWN_RELEASE_PANEL}${version}`;
  if (readFromGlobalState<boolean>(context, shownStateKey)) return false;

  const firstSeenStateKey = `${GlobalStateKey.RELEASE_PANEL_FIRST_SEEN}${version}`;
  const firstSeenAt = readFromGlobalState<number>(context, firstSeenStateKey);

  if (firstSeenAt === undefined) {
    await writeToGlobalState(context, firstSeenStateKey, Date.now());
    return true;
  }

  return Date.now() - firstSeenAt < THREE_DAYS_MS;
}
