/**
 * Builds the final log message string from parts.
 */

import { getLogFunction } from '../../../helpers/getLogFunction';
import { selectQuote } from '../selectQuote';

/**
 * Builds the final log message string from parts.
 * @param parts Array of message parts
 * @param logFunction The log function setting
 * @param quote The quote character setting
 * @param selectedVar The selected variable name
 * @param addSemicolon Whether to add a semicolon at the end
 * @returns The complete log message string
 */
export function buildLogMessage(
  parts: string[],
  logFunction: string,
  quote: string,
  selectedVar: string,
  addSemicolon: boolean,
): string {
  const logFn = getLogFunction(logFunction);
  const quoteToUse = selectQuote(quote, selectedVar);
  const semicolon = addSemicolon ? ';' : '';
  const message = parts.join('');

  return `${logFn}(${quoteToUse}${message}${quoteToUse}, ${selectedVar})${semicolon}`;
}
