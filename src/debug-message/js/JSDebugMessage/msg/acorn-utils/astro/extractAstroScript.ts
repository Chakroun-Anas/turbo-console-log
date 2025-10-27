/**
 * Extracts script content from Astro files and returns the content with offsets.
 * Astro files have two types of scripts:
 * 1. Frontmatter (code between `---` delimiters) - server-side code
 * 2. Inline `<script>` tags - client-side code
 *
 * When selectionLine is provided, it extracts the script section that contains that line.
 * Otherwise, it extracts the frontmatter (if present), or the first inline script.
 *
 * @param sourceCode - The full Astro source code
 * @param selectionLine - Optional line number to find which script contains the selection (0-based)
 * @returns Object containing script content, line offset, and byte offset, or null if no script found
 */
export function extractAstroScript(
  sourceCode: string,
  selectionLine?: number,
): {
  scriptContent: string;
  lineOffset: number;
  byteOffset: number;
} | null {
  const allMatches: Array<{
    scriptContent: string;
    startIndex: number;
    startLine: number;
    endLine: number;
    isFrontmatter: boolean;
    fullMatch?: string;
  }> = [];

  // 1. Check for frontmatter (code between --- delimiters at the start of the file)
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const frontmatterMatch = frontmatterRegex.exec(sourceCode);

  if (frontmatterMatch) {
    const scriptContent = frontmatterMatch[1];
    const startIndex = frontmatterMatch.index;
    const fullMatch = frontmatterMatch[0];

    // Calculate line numbers for frontmatter
    const beforeFrontmatter = sourceCode.substring(0, startIndex);
    const startLineOfDelimiter = beforeFrontmatter.split('\n').length - 1;

    // Frontmatter content starts after the opening --- line
    const startLineOfContent = startLineOfDelimiter + 1;
    const endLineOfContent =
      startLineOfContent + scriptContent.split('\n').length - 1;

    allMatches.push({
      scriptContent,
      startIndex,
      startLine: startLineOfContent,
      endLine: endLineOfContent,
      isFrontmatter: true,
      fullMatch,
    });
  }

  // 2. Find all inline <script> tags (client-side scripts)
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
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
      isFrontmatter: false,
    });
  }

  if (allMatches.length === 0) {
    return null;
  }

  // If selectionLine is provided, find the script that contains it
  let selectedMatch = allMatches[0]; // Default to first script (usually frontmatter)
  if (selectionLine !== undefined) {
    const matchContainingLine = allMatches.find(
      (m) => selectionLine >= m.startLine && selectionLine <= m.endLine,
    );
    if (matchContainingLine) {
      selectedMatch = matchContainingLine;
    } else {
      // Selection line is outside any script section
      throw new Error(
        'Turbo logging works only inside frontmatter (---...---) or <script> blocks in Astro files.',
      );
    }
  } else {
    // No selection line provided - prefer frontmatter over inline scripts
    const frontmatter = allMatches.find((m) => m.isFrontmatter);
    if (frontmatter) {
      selectedMatch = frontmatter;
    }
  }

  // Calculate offsets for the selected script
  if (selectedMatch.isFrontmatter) {
    // For frontmatter, offset is after the opening --- line
    const beforeFrontmatter = sourceCode.substring(0, selectedMatch.startIndex);
    const lineOffset = beforeFrontmatter.split('\n').length; // +1 for the --- line itself

    // Byte offset is after "---\n"
    const openingDelimiter = selectedMatch.fullMatch!.substring(
      0,
      selectedMatch.fullMatch!.indexOf('\n') + 1,
    );
    const byteOffset = selectedMatch.startIndex + openingDelimiter.length;

    return {
      scriptContent: selectedMatch.scriptContent,
      lineOffset,
      byteOffset,
    };
  } else {
    // For inline <script> tags
    const beforeScript = sourceCode.substring(0, selectedMatch.startIndex);
    const lineOffset = beforeScript.split('\n').length - 1;

    const openingTag = selectedMatch.fullMatch!.substring(
      0,
      selectedMatch.fullMatch!.indexOf('>') + 1,
    );
    const byteOffset = selectedMatch.startIndex + openingTag.length;

    return {
      scriptContent: selectedMatch.scriptContent,
      lineOffset: lineOffset + openingTag.split('\n').length - 1,
      byteOffset,
    };
  }
}
