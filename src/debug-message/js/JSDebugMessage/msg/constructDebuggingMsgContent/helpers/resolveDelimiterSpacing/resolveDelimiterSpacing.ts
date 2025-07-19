/**
 * Resolves delimiter spacing based on prefix context to avoid duplication.
 */

/**
 * Resolves delimiter spacing based on prefix context to avoid duplication.
 * If the prefix already ends with the delimiter and space, returns just a space.
 * Otherwise, returns the delimiter with appropriate spacing.
 * @param prefix The prefix string to check for existing delimiter
 * @param delimiter The delimiter string
 * @param addSpace Whether to add spaces around the delimiter
 * @returns The resolved delimiter string or spacing
 */
export function resolveDelimiterSpacing(
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
