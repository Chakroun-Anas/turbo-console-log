import { TextDocument, Range, Position, Uri } from 'vscode';

export const makeTextDocument = (
  lines: string[],
  fileName: string = 'mockDocument.ts',
): TextDocument =>
  ({
    fileName,
    uri: { fsPath: fileName } as Uri,
    lineCount: lines.length,
    getText: (range?: Range) => {
      if (!range) return lines.join('\n');

      const { start, end } = range;

      if (start.line === end.line) {
        return lines[start.line].slice(start.character, end.character);
      }

      const resultLines = lines.slice(start.line, end.line + 1);
      resultLines[0] = resultLines[0].slice(start.character);
      resultLines[resultLines.length - 1] = resultLines[
        resultLines.length - 1
      ].slice(0, end.character);

      return resultLines.join('\n');
    },
    getWordRangeAtPosition: (position: Position): Range | undefined => {
      const lineText = lines[position.line];
      const wordRegex = /\w+/g;

      let match: RegExpExecArray | null;
      while ((match = wordRegex.exec(lineText)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (position.character >= start && position.character <= end) {
          return new Range(
            new Position(position.line, start),
            new Position(position.line, end),
          );
        }
      }

      return undefined;
    },
    lineAt: (i: number) => ({
      text: lines[i],
      firstNonWhitespaceCharacterIndex: lines[i].search(/\S|$/),
      rangeIncludingLineBreak: new Range(
        new Position(i, 0),
        new Position(i, lines[i].length + 1), // +1 for line break
      ),
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
    save: jest.fn().mockResolvedValue(true),
  }) as unknown as TextDocument;
