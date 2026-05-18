/**
 * Helper to get the php-parser Engine instance for tests.
 * This ensures we have a single place to manage the php-parser dependency in tests.
 */

let phpParserEngine: unknown;

/**
 * Gets the php-parser Engine instance.
 * Lazily loads php-parser on first call.
 *
 * @returns The php-parser Engine
 * @throws Error if php-parser cannot be loaded
 */
export function getPhpParser(): unknown {
  if (!phpParserEngine) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      phpParserEngine = require('php-parser');
    } catch (error) {
      throw new Error(
        `Failed to load php-parser for tests: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return phpParserEngine;
}
