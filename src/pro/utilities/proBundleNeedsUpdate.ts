export function proBundleNeedsUpdate(
  currentVersion: string,
  proBundleVersion?: string,
): boolean {
  // Special case: v3.8.0 → v3.8.1 adds Vue SFC feature but doesn't require Pro bundle update
  if (currentVersion === '3.8.1' && proBundleVersion === '3.8.0') {
    return false;
  }

  function compareVersions(v1: string, v2?: string): number {
    if (!v2) return 1;
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const numA = a[i] ?? 0;
      const numB = b[i] ?? 0;
      if (numA > numB) return 1;
      if (numA < numB) return -1;
    }
    return 0;
  }
  return compareVersions(currentVersion, proBundleVersion) > 0;
}
