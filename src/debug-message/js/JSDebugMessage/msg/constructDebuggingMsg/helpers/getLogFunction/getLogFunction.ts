/**
 * Gets the appropriate log function string.
 */

/**
 * Gets the appropriate log function string.
 * @param logFunction The log function setting
 * @param logType The log type setting
 * @returns The formatted log function string
 */
export function getLogFunction(logFunction: string, logType: string): string {
  return logFunction !== 'log' ? logFunction : `console.${logType}`;
}
