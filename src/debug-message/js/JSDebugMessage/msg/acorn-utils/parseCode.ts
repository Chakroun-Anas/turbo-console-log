import * as acorn from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import type { AcornNode } from './types';
import { extractVueScript } from './vue';
import { extractHtmlScript } from './html';
import { extractSvelteScript } from './svelte';
import { extractAstroScript } from './astro';
import { adjustASTLocations } from './adjustASTLocations';

/**
 * Parses JavaScript/TypeScript source code into an Acorn AST.
 * Supports Vue SFC, HTML, Svelte, and Astro files by extracting script content and adjusting line numbers.
 *
 * @param sourceCode - The source code to parse
 * @param fileExtension - Optional file extension (e.g., '.vue', '.html', '.svelte', '.astro', '.js', '.ts')
 * @param selectionLine - Optional line number for context-aware script extraction (0-based)
 * @returns The parsed AST with adjusted locations for Vue SFC, HTML, Svelte, and Astro files
 * @throws Error if parsing fails
 */
export function parseCode(
  sourceCode: string,
  fileExtension: string,
  selectionLine: number,
): AcornNode {
  let codeToParse = sourceCode;
  let lineOffset = 0;
  let byteOffset = 0;
  const isVueFile = fileExtension?.toLowerCase() === '.vue';
  const isHtmlFile = fileExtension?.toLowerCase() === '.html';
  const isSvelteFile = fileExtension?.toLowerCase() === '.svelte';
  const isAstroFile = fileExtension?.toLowerCase() === '.astro';

  // Determine if JSX should be enabled based on file extension
  // JSX is only needed for .jsx and .tsx files
  // Vue, Svelte, and Astro script blocks contain pure TS/JS, not JSX
  const needsJsx =
    fileExtension?.toLowerCase() === '.jsx' ||
    fileExtension?.toLowerCase() === '.tsx';

  // Extract script from Vue SFC if applicable
  if (isVueFile) {
    const extracted = extractVueScript(sourceCode, selectionLine);

    if (!extracted) {
      throw new Error(
        'No <script> block found in this .vue file. Add a <script> or <script setup> section to use Turbo logging.',
      );
    }

    codeToParse = extracted.scriptContent;
    lineOffset = extracted.lineOffset;
    byteOffset = extracted.byteOffset;
  }

  // Extract script from HTML file if applicable
  if (isHtmlFile) {
    const extracted = extractHtmlScript(sourceCode, selectionLine);

    if (!extracted) {
      throw new Error(
        'No <script> block found in this HTML file. Add a <script> section to use Turbo logging.',
      );
    }

    codeToParse = extracted.scriptContent;
    lineOffset = extracted.lineOffset;
    byteOffset = extracted.byteOffset;
  }

  // Extract script from Svelte file if applicable
  if (isSvelteFile) {
    const extracted = extractSvelteScript(sourceCode, selectionLine);

    if (!extracted) {
      throw new Error(
        'No <script> block found in this Svelte file. Add a <script> or <script context="module"> section to use Turbo logging.',
      );
    }

    codeToParse = extracted.scriptContent;
    lineOffset = extracted.lineOffset;
    byteOffset = extracted.byteOffset;
  }

  // Extract script from Astro file if applicable
  if (isAstroFile) {
    const extracted = extractAstroScript(sourceCode, selectionLine);

    if (!extracted) {
      throw new Error(
        'No frontmatter or <script> block found in this Astro file. Add frontmatter (---...---) or a <script> section to use Turbo logging.',
      );
    }

    codeToParse = extracted.scriptContent;
    lineOffset = extracted.lineOffset;
    byteOffset = extracted.byteOffset;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser = acorn.Parser.extend(tsPlugin({ jsx: needsJsx })) as any;
    let ast = parser.parse(codeToParse, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    }) as AcornNode;

    // Adjust AST locations if we extracted from Vue SFC, HTML, Svelte, or Astro file
    if (lineOffset > 0 || byteOffset > 0) {
      ast = adjustASTLocations(ast, lineOffset, byteOffset);
    }

    return ast;
  } catch (error) {
    throw new Error(
      `Failed to parse source code: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
