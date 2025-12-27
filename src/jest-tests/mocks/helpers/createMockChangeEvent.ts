import * as vscode from 'vscode';

/**
 * Creates a mock TextDocumentChangeEvent for testing text document changes
 * Useful for testing listeners that react to document edits (e.g., onDidChangeTextDocument)
 */
export function createMockChangeEvent(
  fileName: string,
  changes: Array<{
    text: string;
    startLine: number;
    startCharacter: number;
    endLine: number;
    endCharacter: number;
    rangeLength: number;
    rangeOffset: number;
  }>,
  lineText: string = '',
): vscode.TextDocumentChangeEvent {
  const contentChanges = changes.map((change) => ({
    text: change.text,
    rangeLength: change.rangeLength,
    rangeOffset: change.rangeOffset,
    range: {
      start: {
        line: change.startLine,
        character: change.startCharacter,
      },
      end: {
        line: change.endLine,
        character: change.endCharacter,
      },
    },
  }));

  return {
    document: {
      fileName,
      lineAt: jest.fn(() => ({
        text: lineText,
      })),
      uri: {
        toString: () => `file://${fileName}`,
      },
    } as unknown as vscode.TextDocument,
    contentChanges:
      contentChanges as unknown as vscode.TextDocumentContentChangeEvent[],
    reason: undefined,
  } as vscode.TextDocumentChangeEvent;
}
