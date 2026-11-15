export function leadingWhitespace(text: string): string {
  return text.match(/^\s*/)?.[0] ?? '';
}
