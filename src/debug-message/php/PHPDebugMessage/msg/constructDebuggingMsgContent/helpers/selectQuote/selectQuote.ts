/**
 * Selects the appropriate quote character based on the content for PHP.
 */

/**
 * Selects the appropriate quote character based on the content.
 * For PHP, we need to consider single vs double quotes and escaping.
 * @param defaultQuote The default quote character from settings
 * @param content The content to be quoted
 * @returns The appropriate quote character
 */
export function selectQuote(defaultQuote: string, content: string): string {
  // In PHP, double quotes allow variable interpolation, single quotes don't
  // If content contains double quotes, use single quotes
  if (content.includes('"')) {
    return "'";
  }
  // If content contains single quotes, use double quotes
  if (content.includes("'")) {
    return '"';
  }

  return defaultQuote;
}
