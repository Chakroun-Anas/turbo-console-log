import type { TurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import { leadingWhitespace } from './leadingWhitespace';

/**
 * One indentation level of the file: a tab when `blockIndent` (the indent of
 * the line opening the block) holds a tab, otherwise the editor tab size in
 * spaces. A block opened at column 0 has no indent to read, so the first
 * indented line of the file decides.
 */
export function indentUnit(
  document: TurboTextDocument,
  blockIndent: string,
  tabSize: number,
): string {
  const spaces = ' '.repeat(tabSize);
  if (blockIndent.includes('\t')) return '\t';
  if (blockIndent.length > 0) return spaces;
  for (let line = 0; line < document.lineCount; line++) {
    const { text } = document.lineAt(line);
    if (text.trim() === '') continue;
    const indent = leadingWhitespace(text);
    if (indent.startsWith('\t')) return '\t';
    // One space is the continuation of a block comment, not an indent
    if (indent === ' ') continue;
    if (indent.length > 0) return spaces;
  }
  return spaces;
}
