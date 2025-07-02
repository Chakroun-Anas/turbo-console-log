import { TextDocument } from 'vscode';

export function propertyAccessAssignmentLine(
  document: TextDocument,
  selectionLine: number,
): number {
  let currentLine = selectionLine;

  while (currentLine + 1 < document.lineCount) {
    const thisLineText = document.lineAt(currentLine).text.trim();
    const nextLineText = document.lineAt(currentLine + 1).text.trim();

    // 🚩 1. Does *this* line clearly continue onto the next?
    // eslint-disable-next-line no-useless-escape
    if (/[.\[]$/.test(thisLineText) || /\?\.$/.test(thisLineText)) {
      currentLine++;
      continue;
    }

    // 🚩 2. Is next line obviously the start of something new?
    if (
      nextLineText === '' ||
      /^[a-zA-Z_$][\w$]*\s*=/.test(nextLineText) || // new assignment
      /^[)}\];]/.test(nextLineText) // closing block
    ) {
      break;
    }

    // 🚩 3. Does the next line *begin* with a continuation token?
    // eslint-disable-next-line no-useless-escape
    if (/^[.\[]/.test(nextLineText) || /^\?\./.test(nextLineText)) {
      currentLine++;
      continue;
    }

    break; // none of the continuation rules matched
  }

  return currentLine + 1;
}
