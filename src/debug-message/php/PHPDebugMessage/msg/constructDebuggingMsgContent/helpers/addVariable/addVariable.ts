/**
 * Adds the selected variable to the log message parts.
 */

/**
 * Adds the selected variable to the log message parts.
 * @param selectedVar The selected variable name
 * @param logMessageSuffix The suffix to add after the variable
 * @returns Array of message parts for the variable
 */
export function addVariable(
  selectedVar: string,
  logMessageSuffix: string,
): string[] {
  return [selectedVar, logMessageSuffix];
}
