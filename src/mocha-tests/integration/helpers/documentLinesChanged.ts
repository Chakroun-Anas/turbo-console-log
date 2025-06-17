import * as vscode from 'vscode';
export const documentLinesChanged = (
  textDocument: vscode.TextDocument,
  lines: Array<number>,
): Array<Promise<void>> => {
  return lines.map((line) => {
    return new Promise<void>((resolve) => {
      const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === textDocument && event.contentChanges.length) {
          if (
            event.contentChanges.some(
              (change) => change.range.start.line === line,
            )
          ) {
            disposable.dispose();
            resolve();
          }
        }
      });
    });
  });
};
