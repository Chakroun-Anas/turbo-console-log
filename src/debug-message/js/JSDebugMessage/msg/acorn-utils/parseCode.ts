import * as acorn from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import type { AcornNode } from './types';

/**
 * Parses JavaScript/TypeScript source code into an Acorn AST.
 *
 * @param sourceCode - The source code to parse
 * @param fileExtension - Optional file extension (e.g., '.vue', '.js', '.ts')
 * @returns The parsed AST
 * @throws Error if parsing fails
 */
export function parseCode(
  sourceCode: string,
  fileExtension?: string,
): AcornNode {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser = acorn.Parser.extend(tsPlugin({ jsx: true })) as any;
    const ast = parser.parse(sourceCode, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    });
    return ast as AcornNode;
  } catch (error) {
    // Check if this is a Vue file
    const isVueFile = fileExtension?.toLowerCase() === '.vue';
    if (isVueFile) {
      throw new Error(
        'Only Vue 3 Composition API scripts are supported at the moment. Please isolate your <script> code or test it in a standalone file.',
      );
    }

    throw new Error(
      `Failed to parse source code: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
