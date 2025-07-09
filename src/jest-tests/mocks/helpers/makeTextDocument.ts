import { TextDocument } from 'vscode';

export const makeTextDocument = (lines: string[]): TextDocument =>
  ({
    fileName: 'mockDocument.ts',
    lineCount: lines.length,
    getText: () => lines.join('\n'),
    lineAt: (i: number) => ({
      text: lines[i],
      firstNonWhitespaceCharacterIndex: lines[i].search(/\S|$/),
    }),
    positionAt: (offset: number) => {
      let total = 0;
      for (let line = 0; line < lines.length; line++) {
        const lineLength = lines[line].length + 1; // +1 for '\n'
        if (offset < total + lineLength) {
          return { line, character: offset - total };
        }
        total += lineLength;
      }
      return {
        line: lines.length - 1,
        character: lines[lines.length - 1].length,
      };
    },
    offsetAt: (position: { line: number; character: number }) => {
      let offset = 0;
      for (let i = 0; i < position.line; i++) {
        offset += lines[i].length + 1;
      }
      return offset + position.character;
    },
  }) as unknown as TextDocument;
