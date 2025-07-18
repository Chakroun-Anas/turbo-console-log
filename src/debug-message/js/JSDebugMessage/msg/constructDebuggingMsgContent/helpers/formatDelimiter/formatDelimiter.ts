/**
 * Formats a delimiter with proper spacing.
 */

/**
 * Formats a delimiter with proper spacing.
 * @param prefix The prefix string
 * @param delimiter The delimiter string
 * @param addSpace Whether to add spaces around the delimiter
 * @returns The formatted delimiter string
 */
export function formatDelimiter(
  prefix: string,
  delimiter: string,
  addSpace: boolean = true,
): string {
  if (prefix.length === 0 || delimiter.length === 0) {
    return addSpace ? ' ' : '';
  }
  if (prefix === `${delimiter} `) {
    return addSpace ? ' ' : '';
  }
  return addSpace ? ` ${delimiter} ` : delimiter;
}
