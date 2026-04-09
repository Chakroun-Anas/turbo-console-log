import { openTurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import * as fs from 'fs';
import * as path from 'path';

describe('TurboTextDocument', () => {
  const fixturesPath = path.join(__dirname, 'fixtures');

  describe('openTurboTextDocument', () => {
    describe('lineCount property', () => {
      it('should return correct line count for multi-line document', () => {
        const content = 'line 1\nline 2\nline 3';
        const doc = openTurboTextDocument(content);

        expect(doc.lineCount).toBe(3);
      });

      it('should return 1 for single line document', () => {
        const content = 'single line';
        const doc = openTurboTextDocument(content);

        expect(doc.lineCount).toBe(1);
      });

      it('should return 1 for empty string', () => {
        const content = '';
        const doc = openTurboTextDocument(content);

        expect(doc.lineCount).toBe(1);
      });

      it('should handle trailing newline correctly', () => {
        const content = 'line 1\nline 2\n';
        const doc = openTurboTextDocument(content);

        // Split creates empty string after final newline
        expect(doc.lineCount).toBe(3);
      });

      it('should match line count from fixture files', () => {
        const simpleContent = fs.readFileSync(
          path.join(fixturesPath, 'simple.js'),
          'utf8',
        );
        const doc = openTurboTextDocument(simpleContent);

        // simple.js has 3 lines of code + trailing newline = 4 lines
        expect(doc.lineCount).toBe(4);
      });
    });

    describe('lineAt(index)', () => {
      it('should return correct line text', () => {
        const content = 'line 1\nline 2\nline 3';
        const doc = openTurboTextDocument(content);

        expect(doc.lineAt(0).text).toBe('line 1');
        expect(doc.lineAt(1).text).toBe('line 2');
        expect(doc.lineAt(2).text).toBe('line 3');
      });

      it('should return correct line number', () => {
        const content = 'line 1\nline 2\nline 3';
        const doc = openTurboTextDocument(content);

        expect(doc.lineAt(0).lineNumber).toBe(0);
        expect(doc.lineAt(1).lineNumber).toBe(1);
        expect(doc.lineAt(2).lineNumber).toBe(2);
      });

      it('should return correct range metadata', () => {
        const content = 'hello\nworld';
        const doc = openTurboTextDocument(content);

        const line0 = doc.lineAt(0);
        expect(line0.rangeIncludingLineBreak).toEqual({
          start: { line: 0, character: 0 },
          end: { line: 1, character: 0 }, // Extends to next line (includes \n)
        });

        const line1 = doc.lineAt(1);
        expect(line1.rangeIncludingLineBreak).toEqual({
          start: { line: 1, character: 0 },
          end: { line: 1, character: 5 }, // Last line, no trailing \n
        });
      });

      it('should handle empty lines', () => {
        const content = 'line 1\n\nline 3';
        const doc = openTurboTextDocument(content);

        const emptyLine = doc.lineAt(1);
        expect(emptyLine.text).toBe('');
        expect(emptyLine.lineNumber).toBe(1);
        expect(emptyLine.rangeIncludingLineBreak).toEqual({
          start: { line: 1, character: 0 },
          end: { line: 2, character: 0 }, // Extends to next line (includes \n)
        });
      });

      it('should throw error for negative index', () => {
        const content = 'line 1\nline 2';
        const doc = openTurboTextDocument(content);

        expect(() => doc.lineAt(-1)).toThrow(
          'Line index -1 out of range (0-1)',
        );
      });

      it('should throw error for index >= lineCount', () => {
        const content = 'line 1\nline 2';
        const doc = openTurboTextDocument(content);

        expect(() => doc.lineAt(2)).toThrow('Line index 2 out of range (0-1)');
      });

      it('should work with fixture files', () => {
        const multilineContent = fs.readFileSync(
          path.join(fixturesPath, 'multiline.ts'),
          'utf8',
        );
        const doc = openTurboTextDocument(multilineContent);

        // First line
        expect(doc.lineAt(0).text).toBe('const user = {');

        // Line with console.log
        expect(doc.lineAt(5).text).toBe("console.log('User data:', user);");

        // Last line (after trailing newline is empty string)
        const lastLine = doc.lineAt(doc.lineCount - 1);
        expect(lastLine.text).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should handle Windows line endings (CRLF)', () => {
        const content = 'line 1\r\nline 2\r\nline 3';
        const doc = openTurboTextDocument(content);

        // Note: split('\n') will keep \r in the text
        expect(doc.lineCount).toBe(3);
        expect(doc.lineAt(0).text).toBe('line 1\r');
        expect(doc.lineAt(1).text).toBe('line 2\r');
      });

      it('should handle mixed line endings', () => {
        const content = 'line 1\nline 2\r\nline 3';
        const doc = openTurboTextDocument(content);

        expect(doc.lineCount).toBe(3);
        expect(doc.lineAt(0).text).toBe('line 1');
        expect(doc.lineAt(1).text).toBe('line 2\r');
      });

      it('should handle lines with special characters', () => {
        const content = 'console.log("Hello 世界");\nconst emoji = "🚀"';
        const doc = openTurboTextDocument(content);

        expect(doc.lineAt(0).text).toBe('console.log("Hello 世界");');
        expect(doc.lineAt(1).text).toBe('const emoji = "🚀"');
      });

      it('should handle very long lines', () => {
        const longLine = 'x'.repeat(10000);
        const content = `short\n${longLine}\nshort`;
        const doc = openTurboTextDocument(content);

        expect(doc.lineAt(1).text.length).toBe(10000);
        expect(doc.lineAt(1).rangeIncludingLineBreak.end.line).toBe(2); // Extends to next line
        expect(doc.lineAt(1).rangeIncludingLineBreak.end.character).toBe(0);
      });
    });

    describe('compatibility with VS Code TextDocument interface', () => {
      it('should provide the same lineCount interface', () => {
        const content = 'line 1\nline 2';
        const doc = openTurboTextDocument(content);

        // Should be accessible as property (not method)
        expect(typeof doc.lineCount).toBe('number');
        expect(doc.lineCount).toBe(2);
      });

      it('should provide the same lineAt interface', () => {
        const content = 'line 1\nline 2';
        const doc = openTurboTextDocument(content);

        // Should be callable as method
        expect(typeof doc.lineAt).toBe('function');

        const line = doc.lineAt(0);
        expect(line).toHaveProperty('text');
        expect(line).toHaveProperty('lineNumber');
        expect(line).toHaveProperty('rangeIncludingLineBreak');
      });

      it('should have range structure compatible with VS Code Range', () => {
        const content = 'test';
        const doc = openTurboTextDocument(content);

        const range = doc.lineAt(0).rangeIncludingLineBreak;

        // VS Code Range has start and end with line/character
        expect(range.start).toHaveProperty('line');
        expect(range.start).toHaveProperty('character');
        expect(range.end).toHaveProperty('line');
        expect(range.end).toHaveProperty('character');

        expect(typeof range.start.line).toBe('number');
        expect(typeof range.start.character).toBe('number');
      });
    });
  });
});
