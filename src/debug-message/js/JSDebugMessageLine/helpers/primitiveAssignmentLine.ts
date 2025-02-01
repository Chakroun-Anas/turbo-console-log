import { TextDocument } from 'vscode';

export function primitiveAssignmentLine(
  document: TextDocument,
  selectionLine: number,
): number {
  const lineText = document.lineAt(selectionLine).text;

  // Check if the line ends with an assignment operator (=) or is incomplete
  if (lineText.trim().endsWith('=') || lineText.trim().endsWith(':')) {
    // Find the next line that is NOT an empty line or a continuation
    let nextLine = selectionLine + 1;
    while (
      nextLine < document.lineCount &&
      (document.lineAt(nextLine).text.trim() === '' ||
        document.lineAt(nextLine).text.trim().startsWith('.'))
    ) {
      nextLine++;
    }
    return nextLine + 1;
  }

  return selectionLine + 1;
}
