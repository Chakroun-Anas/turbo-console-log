/**
 * Selects the appropriate quote character based on the content.
 */

/**
 * Selects the appropriate quote character based on the content.
 * @param defaultQuote The default quote character from settings
 * @param content The content to be quoted
 * @returns The appropriate quote character
 */
export function selectQuote(defaultQuote: string, content: string): string {
  const trimmedContent = content.trim();
  // If the variable starts with `{`, it's likely an object literal → use backticks
  if (trimmedContent.startsWith('{')) {
    return '`';
  }
  if (content.includes('"')) {
    return '`';
  }
  if (content.includes("'")) {
    return '"';
  }
  return defaultQuote;
}
