import * as vscode from 'vscode';

/**
 * Supported file extensions for JS/TS and framework files
 * Matches Pro's supported file types for consistent detection
 */
const supportedExtensions = [
  'ts',
  'js',
  'tsx',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
  'vue',
  'svelte',
  'astro',
];

/**
 * Checks if the given document is a JavaScript or TypeScript file
 * Includes framework files (Vue, Svelte, Astro) that contain JS/TS code
 * @param document VS Code text document
 * @returns true if document is JS/TS file or framework file
 */
export function isJavaScriptOrTypeScriptFile(
  document: vscode.TextDocument,
): boolean {
  const filePath = document.uri.fsPath;
  const extension = filePath.split('.').pop()?.toLowerCase();
  return extension ? supportedExtensions.includes(extension) : false;
}
