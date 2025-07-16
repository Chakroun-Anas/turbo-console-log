import * as vscode from 'vscode';

/**
 * Makes a flexible mocked TextEditor
 */
export const makeTextEditor = ({
  document,
  selections,
  tabSize = 2,
}: {
  document: vscode.TextDocument;
  selections?: vscode.Selection[];
  tabSize?: number;
}): vscode.TextEditor => {
  return {
    document,
    selections,
    edit: jest.fn(),
    options: {
      tabSize,
    },
  } as unknown as vscode.TextEditor;
};
