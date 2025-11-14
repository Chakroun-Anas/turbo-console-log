import * as vscode from 'vscode';

/**
 * Checks if the given document is a PHP file
 * @param document VS Code text document
 * @returns true if document is a PHP file
 */
export function isPhpFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'php';
}
