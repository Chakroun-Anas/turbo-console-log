/**
 * Extracts script content from Svelte files and returns the content with offsets.
 * Svelte files can have two script tags:
 * 1. Regular `<script>` for component instance code
 * 2. `<script context="module">` for module-level code
 *
 * When selectionLine is provided, it extracts the script tag that contains that line.
 * Otherwise, it extracts the first script tag found (preferring regular script over module).
 *
 * @param sourceCode - The full Svelte source code
 * @param selectionLine - Optional line number to find which script contains the selection (0-based)
 * @returns Object containing script content, line offset, and byte offset, or null if no script found
 */
export function extractSvelteScript(
  sourceCode: string,
  selectionLine?: number,
): {
  scriptContent: string;
  lineOffset: number;
  byteOffset: number;
} | null {
  // Find all script tags with their positions
  // Svelte supports both regular and module context scripts
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const allMatches: Array<{
    fullMatch: string;
    scriptContent: string;
    startIndex: number;
    startLine: number;
    endLine: number;
    isModuleContext: boolean;
  }> = [];

  let match;
  while ((match = scriptTagRegex.exec(sourceCode)) !== null) {
    const fullMatch = match[0];
    const scriptContent = match[1];
    const startIndex = match.index;

    // Check if this is a module context script
    const openingTag = fullMatch.substring(0, fullMatch.indexOf('>') + 1);
    const isModuleContext = /context\s*=\s*["']module["']/i.test(openingTag);

    // Calculate line numbers for this script tag
    const beforeScript = sourceCode.substring(0, startIndex);
    const startLineOfTag = beforeScript.split('\n').length - 1;

    const openingTagLines = openingTag.split('\n').length - 1;
    const startLineOfContent = startLineOfTag + openingTagLines;

    const endLineOfContent =
      startLineOfContent + scriptContent.split('\n').length - 1;

    allMatches.push({
      fullMatch,
      scriptContent,
      startIndex,
      startLine: startLineOfContent,
      endLine: endLineOfContent,
      isModuleContext,
    });
  }

  if (allMatches.length === 0) {
    return null;
  }

  // If selectionLine is provided, find the script that contains it
  let selectedMatch = allMatches[0]; // Default to first script
  if (selectionLine !== undefined) {
    const matchContainingLine = allMatches.find(
      (m) => selectionLine >= m.startLine && selectionLine <= m.endLine,
    );
    if (matchContainingLine) {
      selectedMatch = matchContainingLine;
    } else {
      // Selection line is outside any script tag
      throw new Error(
        'Turbo logging works only inside <script> blocks in Svelte files.',
      );
    }
  } else {
    // No selection line provided - prefer regular script over module context
    const regularScript = allMatches.find((m) => !m.isModuleContext);
    if (regularScript) {
      selectedMatch = regularScript;
    }
  }

  // Calculate offsets for the selected script
  const beforeScript = sourceCode.substring(0, selectedMatch.startIndex);
  const lineOffset = beforeScript.split('\n').length - 1;

  const openingTag = selectedMatch.fullMatch.substring(
    0,
    selectedMatch.fullMatch.indexOf('>') + 1,
  );
  const byteOffset =
    selectedMatch.startIndex +
    openingTag.length +
    (openingTag.endsWith('\n') ? 0 : 0);

  return {
    scriptContent: selectedMatch.scriptContent,
    lineOffset: lineOffset + openingTag.split('\n').length - 1,
    byteOffset,
  };
}
