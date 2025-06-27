import { TextDocument } from 'vscode';

export const makeTextDocument = (lines: string[]): TextDocument =>
  ({
    lineCount: lines.length,
    lineAt: (i: number) => ({
      text: lines[i],
      firstNonWhitespaceCharacterIndex: lines[i].search(/\S|$/),
    }),
  }) as unknown as TextDocument;
