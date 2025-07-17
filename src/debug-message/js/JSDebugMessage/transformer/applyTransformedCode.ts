import vscode from 'vscode';

export async function applyTransformedCode(
  document: vscode.TextDocument,
  transformedCode: string,
) {
  const editor = vscode.window.activeTextEditor;
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
  const range = new vscode.Range(
    document.positionAt(startOffset),
    document.positionAt(endOriginal),
  );

  await editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.replace(range, newChunk);
  });
}
