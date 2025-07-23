/**
 * Resolves delimiter spacing
 * Returns the delimiter with appropriate spacing.
 * @param delimiter The delimiter string
 * @param addSpace Whether to add spaces around the delimiter
 * @returns The resolved delimiter string or spacing
 */
export function resolveDelimiterSpacing(
  delimiter: string,
  addSpace: boolean = true,
): string {
  return addSpace ? ` ${delimiter} ` : delimiter;
}
