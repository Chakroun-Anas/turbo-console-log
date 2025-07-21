import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { LogType } from '@/entities/extension/extensionProperties';

// Mock the dependencies
jest.mock('@/debug-message/js/JSDebugMessage/detectAll/helpers', () => ({
  logFunctionToUse: jest.fn(),
}));

jest.mock('@/debug-message/js/JSDebugMessage/helpers', () => ({
  spacesBeforeLogMsg: jest.fn(),
}));

jest.mock('@/utilities', () => ({
  closingContextLine: jest.fn(),
}));

import { logFunctionToUse } from '@/debug-message/js/JSDebugMessage/detectAll/helpers';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/helpers';
import { closingContextLine } from '@/utilities';

const mockLogFunctionToUse = logFunctionToUse as jest.MockedFunction<
  typeof logFunctionToUse
>;
const mockSpacesBeforeLogMsg = spacesBeforeLogMsg as jest.MockedFunction<
  typeof spacesBeforeLogMsg
>;
const mockClosingContextLine = closingContextLine as jest.MockedFunction<
  typeof closingContextLine
>;

describe('detectAll', () => {
  const defaultExtensionProperties: ExtensionProperties = {
    wrapLogMessage: false,
    logMessagePrefix: '🚀',
    logMessageSuffix: ':',
    addSemicolonInTheEnd: false,
    insertEnclosingClass: true,
    logCorrectionNotificationEnabled: false,
    insertEnclosingFunction: true,
    insertEmptyLineBeforeLogMessage: false,
    insertEmptyLineAfterLogMessage: false,
    quote: '"',
    delimiterInsideMessage: '~',
    includeLineNum: false,
    includeFilename: false,
    logType: 'log' as LogType,
    logFunction: 'console.log',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return empty array when no log messages are found', () => {
      const document = makeTextDocument([
        'const x = 5;',
        'function test() {',
        '  return x;',
        '}',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect single-line log message with prefix and delimiter', () => {
      const document = makeTextDocument([
        'const x = 5;',
        'console.log("🚀 ~ x:", x);',
        'return x;',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(1); // Single line

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[0].lines[0].end.line).toBe(1);
      expect(mockLogFunctionToUse).toHaveBeenCalledWith(
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        undefined,
      );
    });

    it('should detect multi-line log message', () => {
      const document = makeTextDocument([
        'const complexObj = { a: 1, b: 2 };',
        'console.log(',
        '  "🚀 ~ complexObj:",',
        '  complexObj',
        ');',
        'return complexObj;',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(4); // Multi-line ending at line 4

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(4); // Lines 1-4 (0-indexed)
      expect(result[0].spaces).toBe('');
      // Check that we're capturing the correct range of lines
      expect(result[0].lines[0].start.line).toBe(1); // console.log(
      expect(result[0].lines[1].start.line).toBe(2); // "🚀 ~ complexObj:",
      expect(result[0].lines[2].start.line).toBe(3); // complexObj
      expect(result[0].lines[3].start.line).toBe(4); // );
      expect(mockClosingContextLine).toHaveBeenCalledWith(
        document,
        1,
        expect.any(String), // BracketType.PARENTHESIS
      );
    });
  });

  describe('Message validation', () => {
    it('should not include log message without required prefix', () => {
      const document = makeTextDocument([
        'console.log("missing prefix ~", x);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(0);
    });

    it('should not include log message without required delimiter', () => {
      const document = makeTextDocument([
        'console.log("🚀 x missing delimiter", x);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(0);
    });

    it('should include log message with both prefix and delimiter', () => {
      const document = makeTextDocument([
        'console.log("🚀 ~ variable:", variable);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('  ');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('  ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
      expect(result[0].lines[0].end.line).toBe(0);
    });
  });

  describe('Different log functions', () => {
    it('should detect console.warn messages', () => {
      const document = makeTextDocument([
        'console.warn("🚀 ~ warning:", data);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.warn');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        'console.warn',
        'warn' as LogType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
      expect(mockLogFunctionToUse).toHaveBeenCalledWith(
        'console.warn',
        'warn',
        undefined,
      );
    });

    it('should detect console.error messages', () => {
      const document = makeTextDocument([
        'console.error("🚀 ~ error:", error);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.error');
      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        'console.error',
        'error' as LogType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle custom log functions', () => {
      const document = makeTextDocument([
        'logger.debug("🚀 ~ debug:", debugInfo);',
      ]);

      mockLogFunctionToUse.mockReturnValue('logger.debug');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        'logger.debug',
        'debug' as LogType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });
  });

  describe('Special characters handling', () => {
    it('should handle regex special characters in log function name', () => {
      const document = makeTextDocument(['$log.info("🚀 ~ info:", info);']);

      mockLogFunctionToUse.mockReturnValue('$log.info');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        '$log.info',
        'log' as LogType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle regex special characters in prefix', () => {
      const document = makeTextDocument([
        'console.log("[DEBUG] ~ value:", value);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        '[DEBUG]',
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle regex special characters in delimiter', () => {
      const document = makeTextDocument(['console.log("🚀 | value:", value);']);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        '|',
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });
  });

  describe('Multiple log messages', () => {
    it('should detect multiple log messages in the same document', () => {
      const document = makeTextDocument([
        'const x = 5;',
        'console.log("🚀 ~ x:", x);',
        'const y = 10;',
        'console.log("🚀 ~ y:", y);',
        'const z = x + y;',
        'console.log("🚀 ~ z:", z);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine
        .mockReturnValueOnce(1) // First call: line 1
        .mockReturnValueOnce(3) // Second call: line 3
        .mockReturnValueOnce(5); // Third call: line 5

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(3);
      expect(mockClosingContextLine).toHaveBeenCalledTimes(3);

      // Check individual log messages
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1); // First log message

      expect(result[1].spaces).toBe('');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(3); // Second log message

      expect(result[2].spaces).toBe('');
      expect(result[2].lines).toHaveLength(1);
      expect(result[2].lines[0].start.line).toBe(5); // Third log message
    });

    it('should detect some but not all log messages based on validation', () => {
      const document = makeTextDocument([
        'console.log("🚀 ~ valid:", x);',
        'console.log("missing prefix ~ y:", y);',
        'console.log("🚀 z:", z);',
        'console.log("🚀 ~ valid too:", a);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      // Mock to return the same line number for each call (single-line log messages)
      mockClosingContextLine
        .mockReturnValueOnce(0) // First call: line 0
        .mockReturnValueOnce(1) // Second call: line 1
        .mockReturnValueOnce(2) // Third call: line 2
        .mockReturnValueOnce(3); // Fourth call: line 3

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2); // Only lines 0 and 3 should be detected

      // Check that only the valid log messages are included
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0); // First valid log message

      expect(result[1].spaces).toBe('');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(3); // Second valid log message
    });
  });

  describe('Arguments handling', () => {
    it('should pass args to logFunctionToUse', () => {
      const document = makeTextDocument(['console.log("🚀 ~ test:", test);']);

      const args = [{ logFunction: 'customLog' }];
      mockLogFunctionToUse.mockReturnValue('customLog');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
        args,
      );

      expect(mockLogFunctionToUse).toHaveBeenCalledWith(
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        args,
      );
    });

    it('should work without args parameter', () => {
      const document = makeTextDocument(['console.log("🚀 ~ test:", test);']);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(0);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
      expect(mockLogFunctionToUse).toHaveBeenCalledWith(
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        undefined,
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty document', () => {
      const document = makeTextDocument([]);

      mockLogFunctionToUse.mockReturnValue('console.log');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle document with only whitespace', () => {
      const document = makeTextDocument(['   ', '', '  \t  ']);

      mockLogFunctionToUse.mockReturnValue('console.log');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle log messages at the beginning and end of document', () => {
      const document = makeTextDocument([
        'console.log("🚀 ~ start:", start);',
        'const middle = "code";',
        'console.log("🚀 ~ end:", end);',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine
        .mockReturnValueOnce(0) // First call: line 0
        .mockReturnValueOnce(2); // Second call: line 2

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);

      // Check individual log messages
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0); // First log message

      expect(result[1].spaces).toBe('');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(2); // Second log message
    });

    it('should handle multi-line log message at end of document', () => {
      const document = makeTextDocument([
        'const data = { x: 1 };',
        'console.log(',
        '  "🚀 data ~",',
        '  data',
        ');',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockClosingContextLine.mockReturnValue(4);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].spaces).toBe('');
      // Check that we're capturing lines 1-4 (multi-line log message)
      expect(result[0].lines[0].start.line).toBe(1); // console.log(
      expect(result[0].lines[1].start.line).toBe(2); // "🚀 data ~",
      expect(result[0].lines[2].start.line).toBe(3); // data
      expect(result[0].lines[3].start.line).toBe(4); // );
    });
  });

  describe('Complex scenarios', () => {
    it('should handle nested function calls with log messages', () => {
      const document = makeTextDocument([
        'function outer() {',
        '  const x = 5;',
        '  console.log("🚀 ~ x:", x);',
        '  function inner() {',
        '    const y = 10;',
        '    console.log("🚀 ~ y:", y);',
        '  }',
        '}',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('  ');
      mockClosingContextLine
        .mockReturnValueOnce(2) // First call: line 2
        .mockReturnValueOnce(5); // Second call: line 5

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(2);

      // Check individual log messages
      expect(result[0].spaces).toBe('  ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2); // First log message in outer function

      expect(result[1].spaces).toBe('  ');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(5); // Second log message in inner function
    });

    it('should handle log messages in different contexts (classes, functions, etc.)', () => {
      const document = makeTextDocument([
        'class MyClass {',
        '  constructor() {',
        '    console.log("🚀 ~ constructor:", this);',
        '  }',
        '  method() {',
        '    const result = this.compute();',
        '    console.log("🚀 ~ result:", result);',
        '  }',
        '}',
      ]);

      mockLogFunctionToUse.mockReturnValue('console.log');
      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockClosingContextLine
        .mockReturnValueOnce(2) // First call: line 2
        .mockReturnValueOnce(6); // Second call: line 6

      detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(mockLogFunctionToUse).toHaveBeenCalledWith(
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logType,
        undefined,
      );
    });
  });
});
