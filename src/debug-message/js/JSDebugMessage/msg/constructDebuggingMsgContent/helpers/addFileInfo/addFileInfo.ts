/**
 * Adds file information (filename and line number) to the log message parts.
 */

import { resolveDelimiterSpacing } from '../resolveDelimiterSpacing';

/**
 * Adds file information (filename and line number) to the log message parts.
 * @param fileName The file name
 * @param lineNum The line number
 * @param includeFilename Whether to include the filename
 * @param includeLineNum Whether to include the line number
 * @param delimiter The delimiter string
 * @returns Array of message parts for the file info
 */
export function addFileInfo(
  fileName: string,
  lineNum: number,
  includeFilename: boolean,
  includeLineNum: boolean,
  delimiter: string,
): string[] {
  const parts: string[] = [];
  if (includeFilename || includeLineNum) {
    const filePart = includeFilename ? fileName : '';
    const linePart = includeLineNum ? `:${lineNum}` : '';
    parts.push(`${filePart}${linePart}`);
    parts.push(resolveDelimiterSpacing('', delimiter));
  }
  return parts;
}
