const PATH_SEPARATORS = /[/\\]/;

/**
 * Extracts the filename from a full file path.
 * @param fullPath The complete file path
 * @returns The filename without the path
 */
export function getFileName(fullPath: string): string {
  return fullPath.split(PATH_SEPARATORS).pop() || '';
}
