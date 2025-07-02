import { TextDocument } from 'vscode';

export function decoratorChecker(
  document: TextDocument,
  selectionLine: number,
) {
  const currentLineText: string = document.lineAt(selectionLine).text;
  return {
    isChecked: /^@[a-zA-Z0-9]{1,}(.*)[a-zA-Z0-9]{1,}/.test(
      currentLineText.trim(),
    ),
  };
}
