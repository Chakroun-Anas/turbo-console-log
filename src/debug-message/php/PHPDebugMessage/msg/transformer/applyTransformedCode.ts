import type * as vscode from 'vscode';

/**
 * Applies transformed code to a document by replacing only the changed portion.
 * This finds the minimal differing region between original and transformed code
 * and applies it using VS Code's edit API.
 *
 * @param vscodeModule - The injected VS Code API module
 * @param document - The VS Code text document to modify
 * @param transformedCode - The complete transformed source code
 */
export async function applyTransformedCode(
  vscodeModule: typeof vscode,
  document: vscode.TextDocument,
  transformedCode: string,
) {
  const editor = vscodeModule.window.activeTextEditor;
  if (!editor || editor.document !== document) return;

  const originalText = document.getText();

  // Find the region that differs between original and transformed
  let startOffset = 0;
  let endOriginal = originalText.length;
  let endTransformed = transformedCode.length;

  // Find common prefix
  while (
    startOffset < endOriginal &&
    startOffset < endTransformed &&
    originalText[startOffset] === transformedCode[startOffset]
  ) {
    startOffset++;
  }

  // Find common suffix
  while (
    endOriginal > startOffset &&
    endTransformed > startOffset &&
    originalText[endOriginal - 1] === transformedCode[endTransformed - 1]
  ) {
    endOriginal--;
    endTransformed--;
  }

  const newChunk = transformedCode.slice(startOffset, endTransformed);
  const range = new vscodeModule.Range(
    document.positionAt(startOffset),
    document.positionAt(endOriginal),
  );

  await editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.replace(range, newChunk);
  });
}
