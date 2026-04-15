import * as vscode from 'vscode';

/**
 * Checks if the given document is a Python file.
 * @param document VS Code text document
 * @returns true if document is a Python file
 */
export function isPythonFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'python';
}