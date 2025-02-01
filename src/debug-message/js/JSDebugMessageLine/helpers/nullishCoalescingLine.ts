import { TextDocument } from 'vscode';

export function nullishCoalescingLine(
  document: TextDocument,
  selectionLine: number,
): number {
  let concatenatedLines = cleanCode(document.lineAt(selectionLine).text);
  let lineIndex = selectionLine;
  const MAX_LOOKAHEAD = 10; // Look up to 10 lines ahead

  let totalOpenedParentheses = 0;
  let totalClosedParentheses = 0;
  let foundNullishOperator = false;

  for (let i = 1; i < MAX_LOOKAHEAD; i++) {
    if (lineIndex + 1 >= document.lineCount) break; // Stop if out of bounds

    lineIndex++;
    const nextLine = cleanCode(document.lineAt(lineIndex).text);

    if (nextLine === '') continue; // Skip empty lines or purely commented lines

    concatenatedLines += ' ' + nextLine;

    // Count parentheses to detect if we are inside a complex expression
    totalOpenedParentheses += (nextLine.match(/\(/g) || []).length;
    totalClosedParentheses += (nextLine.match(/\)/g) || []).length;

    // Detect if a nullish coalescing (??) operator is found
    if (/\?\?/.test(nextLine)) {
      foundNullishOperator = true;
    }

    // If we detect the full expression (assignment + ?? + valid continuation)
    if (
      foundNullishOperator &&
      /[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*.+\?\?\s*.+/.test(concatenatedLines) &&
      totalOpenedParentheses === totalClosedParentheses
    ) {
      // Ensure that the next line isn't another expression before stopping
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
 * Removes inline comments (`// ...`) and trims unnecessary spaces
 */
function cleanCode(line: string): string {
  return line.replace(/\/\/.*/, '').trim(); // Remove everything after `//`
}
