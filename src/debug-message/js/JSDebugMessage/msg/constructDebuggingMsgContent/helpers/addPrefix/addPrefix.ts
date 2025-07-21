/**
 * Adds a prefix to the log message parts.
 */

import { resolveDelimiterSpacing } from '../resolveDelimiterSpacing';

/**
 * Adds a prefix to the log message parts.
 * @param prefix The prefix string
 * @param delimiter The delimiter string
 * @returns Array of message parts for the prefix
 */
export function addPrefix(prefix: string, delimiter: string): string[] {
  const parts: string[] = [];
  if (prefix.length > 0) {
    parts.push(prefix);
    parts.push(resolveDelimiterSpacing(delimiter));
  }
  return parts;
}
