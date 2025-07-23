/**
 * Builds the final log message string from parts.
 */

import { getLogFunction } from '../getLogFunction';
import { selectQuote } from '../selectQuote';

/**
 * Builds the final log message string from parts.
 * @param parts Array of message parts
 * @param logFunction The log function setting
 * @param logType The log type setting
 * @param quote The quote character setting
 * @param selectedVar The selected variable name
 * @param addSemicolon Whether to add a semicolon at the end
 * @returns The complete log message string
 */
export function buildLogMessage(
  parts: string[],
  logFunction: string,
  logType: string,
  quote: string,
  selectedVar: string,
  addSemicolon: boolean,
): string {
  const logFn = getLogFunction(logFunction, logType);
  const quoteToUse = selectQuote(quote, selectedVar);
  const semicolon = addSemicolon ? ';' : '';
  const message = parts.join('');

  return `${logFn}(${quoteToUse}${message}${quoteToUse}, ${selectedVar})${semicolon}`;
}
