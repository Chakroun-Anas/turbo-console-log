/**
 * Builds the final PHP log message string from parts.
 */

import { getLogFunction } from '../../../helpers/getLogFunction';
import { selectQuote } from '../selectQuote';

/**
 * Builds the final PHP log message string from parts.
 * Different from JS/TS: PHP functions like var_dump take multiple parameters.
 * @param parts Array of message parts
 * @param logFunction The log function setting (var_dump, error_log, print_r)
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

  // Build message based on PHP log function type
  switch (logFn) {
    case 'var_dump':
      // var_dump("message: ", $var) - var_dump accepts multiple parameters
      return `${logFn}(${quoteToUse}${message}${quoteToUse}, ${selectedVar})${semicolon}`;

    case 'print_r':
      // print_r(["message: " => $var]) - print_r outputs directly to console
      return `${logFn}([${quoteToUse}${message}${quoteToUse} => ${selectedVar}])${semicolon}`;

    case 'error_log':
    default:
      // error_log("message: " . print_r($var, true)) - error_log only takes a string message
      return `${logFn}(${quoteToUse}${message}${quoteToUse} . print_r(${selectedVar}, true))${semicolon}`;
  }
}
