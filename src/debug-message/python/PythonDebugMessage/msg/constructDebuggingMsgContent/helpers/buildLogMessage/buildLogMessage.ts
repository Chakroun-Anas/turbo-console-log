import { selectPythonQuote } from '../selectQuote/selectQuote';

/**
 * Builds the Python log statement.
 *
 * Note: Python statements never end with a semicolon. Trailing semicolons are
 * legal but non-idiomatic and are flagged by linters (e.g. flake8 E703), so the
 * global `addSemicolonInTheEnd` setting is intentionally ignored here — unlike
 * JS/TS (optional) and PHP (required), Python must never emit one.
 */
export function buildLogMessage(
  parts: string[],
  logFunction: string,
  quote: string,
  selectedVar: string,
): string {
  const q = selectPythonQuote(quote, selectedVar);
  const message = parts.join('');

  if (logFunction === 'print') {
    return `print(${q}${message}${q}, ${selectedVar})`;
  }

  if (logFunction.startsWith('logging.')) {
    return `${logFunction}(${q}${message} %s${q}, ${selectedVar})`;
  }

  return `${logFunction}(${q}${message}${q}, ${selectedVar})`;
}
