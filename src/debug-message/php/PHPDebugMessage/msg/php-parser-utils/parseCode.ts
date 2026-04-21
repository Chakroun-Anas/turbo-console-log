/**
 * Main PHP code parsing function using php-parser library.
 * Parses PHP source code into an AST that can be traversed and analyzed.
 */

import type { Program } from './types';

/**
 * Parses PHP source code into an Abstract Syntax Tree.
 *
 * @param sourceCode The PHP source code to parse (with or without <?php tags)
 * @param phpParser Injected php-parser Engine (required for Pro bundle context)
 * @returns The parsed AST Program node
 * @throws Error if parsing fails
 *
 * @example
 * ```typescript
 * import Engine from 'php-parser';
 * const code = `<?php
 * $user = "John";
 * echo $user;
 * ?>`;
 * const ast = parseCode(code, Engine);
 * ```
 */
export function parseCode(sourceCode: string, phpParser: unknown): Program {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Engine = phpParser as any;

  if (!Engine) {
    throw new Error(
      'php-parser module must be injected. Cannot proceed without it.',
    );
  }

  const parser = new Engine({
    parser: {
      extractDoc: true,
      php7: true,
    },
    ast: {
      withPositions: true,
    },
    lexer: {
      all_tokens: false,
      comment_tokens: false,
      mode_eval: false,
      asp_tags: false,
      short_tags: false,
    },
  });

  try {
    const ast = parser.parseCode(sourceCode);
    return ast as Program;
  } catch (error) {
    throw new Error(
      `PHP parsing failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Stub implementation for testing without php-parser
 * @deprecated Use parseCode() instead
 */
export function parseCodeStub(sourceCode: string): Program {
  console.warn('parseCode - stub implementation, php-parser not yet installed');
  return {
    kind: 'program',
    children: [],
    loc: {
      start: { line: 1, column: 0, offset: 0 },
      end: { line: 1, column: sourceCode.length, offset: sourceCode.length },
    },
  };
}

/**
 * Safely attempts to parse PHP code, returning null if parsing fails.
 *
 * @param sourceCode The PHP source code to parse
 * @param phpParser Injected php-parser Engine
 * @returns The parsed AST or null if parsing fails
 */
export function tryParseCode(
  sourceCode: string,
  phpParser: unknown,
): Program | null {
  try {
    return parseCode(sourceCode, phpParser);
  } catch {
    return null;
  }
}

/**
 * Checks if a string contains valid PHP code structure.
 * This is a quick check before attempting full parsing.
 *
 * @param sourceCode The source code to check
 * @returns true if the code appears to be PHP
 */
export function isValidPHPCode(sourceCode: string): boolean {
  // Basic checks for PHP code patterns
  const trimmed = sourceCode.trim();

  // Check for PHP opening tag or common PHP constructs
  return (
    trimmed.includes('<?php') ||
    trimmed.includes('<?=') ||
    /\$\w+/.test(trimmed) || // Variables
    /function\s+\w+/.test(trimmed) || // Functions
    /class\s+\w+/.test(trimmed) || // Classes
    /namespace\s+\w+/.test(trimmed) // Namespaces
  );
}
