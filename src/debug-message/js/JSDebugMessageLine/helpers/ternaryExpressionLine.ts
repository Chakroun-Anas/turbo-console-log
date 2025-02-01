import { TextDocument } from 'vscode';

export function ternaryExpressionLine(
  document: TextDocument,
  selectionLine: number,
  lines = 20,
): number {
  let concatenatedLines = cleanCode(document.lineAt(selectionLine).text);
  let lineIndex = selectionLine;
  const MAX_LOOKAHEAD = lines; // Look ahead for multi-line expressions

  let totalOpenedParentheses = 0;
  let totalClosedParentheses = 0;
  let totalOpenedBraces = 0;
  let totalClosedBraces = 0;
  let foundTernaryOperator = false;
  let foundColon = false;

  for (let i = 1; i < MAX_LOOKAHEAD; i++) {
    if (lineIndex + 1 >= document.lineCount) break; // Stop if out of bounds

    lineIndex++;
    const nextLine = cleanCode(document.lineAt(lineIndex).text);

    if (nextLine === '') continue; // Skip empty/comment-only lines

    concatenatedLines += ' ' + nextLine;

    // Count parentheses and curly braces
    totalOpenedParentheses += (nextLine.match(/\(/g) || []).length;
    totalClosedParentheses += (nextLine.match(/\)/g) || []).length;
    totalOpenedBraces += (nextLine.match(/{/g) || []).length;
    totalClosedBraces += (nextLine.match(/}/g) || []).length;

    // Detect ternary structure
    if (/\?/.test(nextLine) && !/\?\./.test(nextLine))
      foundTernaryOperator = true; // Ignore `?.`
    if (/:/.test(nextLine)) foundColon = true;

    // If we detect a complete ternary expression
    if (
      foundTernaryOperator &&
      foundColon &&
      /[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*.+\?.+:.+/.test(concatenatedLines) &&
      totalOpenedParentheses === totalClosedParentheses &&
      totalOpenedBraces === totalClosedBraces
    ) {
      // Ensure the next line isn't another variable assignment before stopping
      if (lineIndex + 1 === document.lineCount) {
        return lineIndex + 1;
      }
      const followingLine = cleanCode(
        document.lineAt(lineIndex + 1)?.text || '',
      );
      if (!/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/.test(followingLine)) {
        return lineIndex + 1; // Insert log after the full expression
      }
    }
  }

  return selectionLine + 1; // Default fallback (log on next line)
}

/**
 * Removes inline comments (`// ...`) and trims unnecessary spaces.
 */
function cleanCode(line: string): string {
  return line.replace(/\/\/.*/, '').trim(); // Remove everything after `//`
}
