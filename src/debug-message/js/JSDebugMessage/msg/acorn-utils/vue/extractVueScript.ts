/**
 * Extracts script content from Vue SFC and returns the content with offsets.
 * When selectionLine is provided, it extracts the script tag that contains that line.
 * Otherwise, it extracts the first script tag found.
 *
 * @param sourceCode - The full Vue SFC source code
 * @param selectionLine - Optional line number to find which script contains the selection (0-based)
 * @returns Object containing script content, line offset, and byte offset, or null if no script found
 */
export function extractVueScript(
  sourceCode: string,
  selectionLine?: number,
): {
  scriptContent: string;
  lineOffset: number;
  byteOffset: number;
} | null {
  // Find all script tags with their positions
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const allMatches: Array<{
    fullMatch: string;
    scriptContent: string;
    startIndex: number;
    startLine: number;
    endLine: number;
  }> = [];

  let match;
  while ((match = scriptTagRegex.exec(sourceCode)) !== null) {
    const fullMatch = match[0];
    const scriptContent = match[1];
    const startIndex = match.index;

    // Calculate line numbers for this script tag
    const beforeScript = sourceCode.substring(0, startIndex);
    const startLineOfTag = beforeScript.split('\n').length - 1;

    const openingTag = fullMatch.substring(0, fullMatch.indexOf('>') + 1);
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
        'Turbo logging works only inside <script> or <script setup> blocks in Vue files.',
      );
    }
  }

  // Calculate offsets for the selected script
  const beforeScript = sourceCode.substring(0, selectedMatch.startIndex);
  const lineOffset = beforeScript.split('\n').length - 1;

  const openingTag = selectedMatch.fullMatch.substring(
    0,
    selectedMatch.fullMatch.indexOf('>') + 1,
  );
  const openingTagLines = openingTag.split('\n').length - 1;

  const byteOffset = selectedMatch.startIndex + openingTag.length;

  return {
    scriptContent: selectedMatch.scriptContent,
    lineOffset: lineOffset + openingTagLines,
    byteOffset,
  };
}
