import { RELEASE_PANEL_VERSIONS } from './shouldShowReleasePanel';

export function resolveReleaseVersion(
  currentVersion: string,
  versions: string[] = RELEASE_PANEL_VERSIONS,
): string | undefined {
  if (versions.length === 0) return undefined;
  if (versions.includes(currentVersion)) return currentVersion;
  return versions[versions.length - 1];
}
