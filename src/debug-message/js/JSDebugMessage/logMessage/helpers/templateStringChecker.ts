import { TextDocument } from 'vscode';

export function templateStringChecker(
  document: TextDocument,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  return {
    isChecked: /`/.test(currentLineText),
  };
}
