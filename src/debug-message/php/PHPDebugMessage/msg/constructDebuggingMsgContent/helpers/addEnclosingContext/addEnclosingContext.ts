/**
 * Adds enclosing context (class and function names) to the log message parts.
 */

import { resolveDelimiterSpacing } from '../resolveDelimiterSpacing';

/**
 * Adds enclosing context (class and function names) to the log message parts.
 * @param className The class name
 * @param functionName The function name
 * @param delimiter The delimiter string
 * @returns Array of message parts for the enclosing context
 */
export function addEnclosingContext(
  className: string,
  functionName: string,
  delimiter: string,
): string[] {
  const parts: string[] = [];
  if (className.length > 0) {
    parts.push(className);
    parts.push(resolveDelimiterSpacing(delimiter));
  }
  if (functionName.length > 0) {
    parts.push(functionName);
    parts.push(resolveDelimiterSpacing(delimiter));
  }
  return parts;
}
