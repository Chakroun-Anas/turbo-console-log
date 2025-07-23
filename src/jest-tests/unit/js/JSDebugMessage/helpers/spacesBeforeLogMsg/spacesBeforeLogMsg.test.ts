import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/helpers/spacesBeforeLogMsg';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('spacesBeforeLogMsg', () => {
  describe('basic indentation detection', () => {
    it('should return spaces from selected variable line when log line is beyond document', () => {
      const document = makeTextDocument([
        'function test() {',
        '  const variable = 42;',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 10);

      expect(result).toBe('  ');
    });

    it('should return deeper indentation when log line has more spaces', () => {
      const document = makeTextDocument([
        'function test() {',
        '  const variable = 42;',
        '    // log line with more indentation',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should return selected variable indentation when it is deeper', () => {
      const document = makeTextDocument([
        'function test() {',
        '    const variable = 42;',
        '  // log line with less indentation',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });
  });

  describe('mixed whitespace handling', () => {
    it('should handle tabs in selected variable line', () => {
      const document = makeTextDocument([
        'function test() {',
        '\t\tconst variable = 42;',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 10);

      expect(result).toBe('\t\t');
    });

    it('should handle mixed spaces and tabs', () => {
      const document = makeTextDocument([
        'function test() {',
        '\t  const variable = 42;', // 3 characters
        '  \t// log line', // 3 characters
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('  \t'); // Returns log line since they're equal length but log line wins
    });

    it('should handle spaces vs tabs comparison by length', () => {
      const document = makeTextDocument([
        'function test() {',
        '    const variable = 42;', // 4 spaces
        '\t// log line', // 1 tab
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    '); // 4 spaces > 1 tab in length
    });
  });

  describe('edge cases', () => {
    it('should handle zero indentation on both lines', () => {
      const document = makeTextDocument([
        'const variable = 42;',
        '// log line',
      ]);

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('');
    });

    it('should handle empty selected variable line', () => {
      const document = makeTextDocument(['', '  // log line']);

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle empty log message line', () => {
      const document = makeTextDocument(['  const variable = 42;', '']);

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle line with only whitespace', () => {
      const document = makeTextDocument(['  const variable = 42;', '    ']);

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('    ');
    });
  });

  describe('line boundary scenarios', () => {
    it('should handle log line at document boundary', () => {
      const document = makeTextDocument([
        '  const variable = 42;',
        '    const another = 24;',
      ]);

      const result = spacesBeforeLogMsg(document, 0, 1);

      expect(result).toBe('    ');
    });

    it('should handle last line as log line', () => {
      const document = makeTextDocument([
        '  const variable = 42;',
        '  const another = 24;',
        '    // last line',
      ]);

      const result = spacesBeforeLogMsg(document, 0, 2);

      expect(result).toBe('    ');
    });

    it('should handle same line numbers for variable and log', () => {
      const document = makeTextDocument(['    const variable = 42;']);

      const result = spacesBeforeLogMsg(document, 0, 0);

      expect(result).toBe('    ');
    });
  });

  describe('complex indentation patterns', () => {
    it('should handle nested function indentation', () => {
      const document = makeTextDocument([
        'function outer() {',
        '  function inner() {',
        '    const variable = 42;',
        '      // deeply nested log line',
        '  }',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 2, 3);

      expect(result).toBe('      ');
    });

    it('should handle class method indentation', () => {
      const document = makeTextDocument([
        'class MyClass {',
        '  method() {',
        '    const variable = 42;',
        '  }',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 2, 10);

      expect(result).toBe('    ');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle JavaScript object literal', () => {
      const document = makeTextDocument([
        'const config = {',
        '  setting: value,',
        '    // comment with more indentation',
        '  another: setting',
        '};',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should handle if statement block', () => {
      const document = makeTextDocument([
        'if (condition) {',
        '  const variable = getValue();',
        '  // log message here',
        '}',
      ]);

      const result = spacesBeforeLogMsg(document, 1, 2);

      expect(result).toBe('  ');
    });
  });
});
