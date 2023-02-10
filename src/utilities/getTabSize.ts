export function getTabSize(tabSize: string | number | undefined): number {
  if (!tabSize) {
    return 4;
  }
  return typeof tabSize === 'string' ? parseInt(tabSize) : tabSize;
}
