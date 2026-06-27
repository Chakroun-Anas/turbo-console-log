import * as vscode from 'vscode';
import axios from 'axios';
import { readFromGlobalState } from './readFromGlobalState';
import { GlobalStateKey } from '@/entities';
import { isTestMode } from '@/runTime';

export const RELEASE_PANEL_VERSIONS = ['3.25.0'];

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

export async function shouldShowReleasePanel(
  context: vscode.ExtensionContext,
  version: string,
  developerId?: string,
): Promise<boolean> {
  if (!RELEASE_PANEL_VERSIONS.includes(version)) return false;

  const stateKey = `${GlobalStateKey.HAS_SHOWN_RELEASE_PANEL}${version}`;
  if (readFromGlobalState<boolean>(context, stateKey)) return false;

  if (!developerId) return true;

  try {
    const response = await axios.get<{ hasBeenShown: boolean }>(
      `${TURBO_WEBSITE_BASE_URL}/api/releasePanelShownCheck`,
      { params: { developerId, version }, timeout: 3000 },
    );
    return !response.data.hasBeenShown;
  } catch {
    // Fail-open: if the server is unreachable, show the panel
    return true;
  }
}
