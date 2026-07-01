import * as vscode from 'vscode';
import { readFromGlobalState } from './readFromGlobalState';
import { GlobalStateKey } from '@/entities';

export const RELEASE_PANEL_VERSIONS = ['3.25.0'];

// Purely local decision — no backend round-trip. The panel is re-shown once
// per version whenever the local guard is missing (fresh install, lost/reset
// state, reinstall). Revealing the panel re-writes the guard (TurboReleasePanel),
// so this self-heals without needing the server to assert "already shown".
export async function shouldShowReleasePanel(
  context: vscode.ExtensionContext,
  version: string,
): Promise<boolean> {
  if (!RELEASE_PANEL_VERSIONS.includes(version)) return false;

  const stateKey = `${GlobalStateKey.HAS_SHOWN_RELEASE_PANEL}${version}`;
  return !readFromGlobalState<boolean>(context, stateKey);
}
