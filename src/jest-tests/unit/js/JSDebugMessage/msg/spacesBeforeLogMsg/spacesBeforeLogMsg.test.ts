import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';
import { openTurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';

describe('spacesBeforeLogMsg', () => {
  describe('basic indentation detection', () => {
    it('should return spaces from selected variable line when log line is beyond document', () => {
      const document = openTurboTextDocument(
        'function test() {\n' + '  const variable = 42;\n' + '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 10);

      expect(result).toBe('  ');
    });

    it('should return deeper indentation when log line has more spaces', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '  const variable = 42;\n' +
          '    // log line with more indentation\n' +
          '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should return selected variable indentation when it is deeper', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '    const variable = 42;\n' +
          '  // log line with less indentation\n' +
          '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });
  });

  describe('mixed whitespace handling', () => {
    it('should handle tabs in selected variable line', () => {
      const document = openTurboTextDocument(
        'function test() {\n' + '\t\tconst variable = 42;\n' + '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 10);

      expect(result).toBe('\t\t');
    });

    it('should handle mixed spaces and tabs', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '\t  const variable = 42;\n' + // 3 characters
          '  \t// log line\n' + // 3 characters
          '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('  \t'); // Returns log line since they're equal length but log line wins
    });

    it('should handle spaces vs tabs comparison by length', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '    const variable = 42;\n' + // 4 spaces
          '\t// log line\n' + // 1 tab
          '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    '); // 4 spaces > 1 tab in length
    });
  });

  describe('edge cases', () => {
    it('should handle zero indentation on both lines', () => {
      const document = openTurboTextDocument(
        'const variable = 42;\n' + '// log line',
      );

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('');
    });

    it('should handle empty selected variable line', () => {
      const document = openTurboTextDocument('\n  // log line');

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle empty log message line', () => {
      const document = openTurboTextDocument('  const variable = 42;\n');

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle line with only whitespace', () => {
      const document = openTurboTextDocument('  const variable = 42;\n    ');

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('    ');
    });
  });

  describe('line boundary scenarios', () => {
    it('should handle log line at document boundary', () => {
      const document = openTurboTextDocument(
        '  const variable = 42;\n' + '    const another = 24;',
      );

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('    ');
    });

    it('should handle last line as log line', () => {
      const document = openTurboTextDocument(
        '  const variable = 42;\n' +
          '  const another = 24;\n' +
          '    // last line',
      );

      const result = spacesBeforeLogMsg(document, 0, 2);

      expect(result).toBe('    ');
    });

    it('should handle same line numbers for variable and log', () => {
      const document = openTurboTextDocument('    const variable = 42;');

      const result = spacesBeforeLogMsg(document, 0, 0);

      expect(result).toBe('    ');
    });
  });

  describe('complex indentation patterns', () => {
    it('should handle nested function indentation', () => {
      const document = openTurboTextDocument(
        'function outer() {\n' +
          '  function inner() {\n' +
          '    const variable = 42;\n' +
          '      // deeply nested log line\n' +
          '  }\n' +
          '}',
      );

      const result = spacesBeforeLogMsg(document, 2, 3);

      expect(result).toBe('      ');
    });

    it('should handle class method indentation', () => {
      const document = openTurboTextDocument(
        'class MyClass {\n' +
          '  method() {\n' +
          '    const variable = 42;\n' +
          '  }\n' +
          '}',
      );

      const result = spacesBeforeLogMsg(document, 2, 10);

      expect(result).toBe('    ');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle JavaScript object literal', () => {
      const document = openTurboTextDocument(
        'const config = {\n' +
          '  setting: value,\n' +
          '    // comment with more indentation\n' +
          '  another: setting\n' +
          '};',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should handle if statement block', () => {
      const document = openTurboTextDocument(
        'if (condition) {\n' +
          '  const variable = getValue();\n' +
          '  // log message here\n' +
          '}',
      );

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('  ');
    });
  });
});
