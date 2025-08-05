import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';

jest.mock('@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg', () => ({
  spacesBeforeLogMsg: jest.fn(),
}));

const mockSpacesBeforeLogMsg = spacesBeforeLogMsg as jest.MockedFunction<
  typeof spacesBeforeLogMsg
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
    logFunction: 'myLogger',
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

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[0].lines[0].end.line).toBe(1);
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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
    });
  });

  describe('Message validation', () => {
    it('should not include log message without required prefix', () => {
      const document = makeTextDocument([
        'console.log("missing prefix ~", x);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(0);
    });

    it('should not include log message without required delimiter', () => {
      const document = makeTextDocument([
        'console.log("🚀 x missing delimiter", x);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('Different log functions', () => {
    it('should detect console.warn messages', () => {
      const document = makeTextDocument([
        'console.warn("🚀 ~ warning:", data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        'console.warn',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should detect console.error messages', () => {
      const document = makeTextDocument([
        'console.error("🚀 ~ error:", error);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');

      const result = detectAll(
        document,
        'console.error',
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        'logger.debug',
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        '$log.info',
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(3);

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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

  describe('Edge cases', () => {
    it('should handle empty document', () => {
      const document = makeTextDocument([]);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle document with only whitespace', () => {
      const document = makeTextDocument(['   ', '', '  \t  ']);

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('  ');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
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

      mockSpacesBeforeLogMsg.mockReturnValue('    ');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].lines[0].start.line).toBe(2); // constructor log
      expect(result[1].lines[0].start.line).toBe(6); // method log
    });

    it('should correctly differentiate between Turbo-generated and manual logs in mixed document', () => {
      const document = makeTextDocument([
        '// Mixed document with various log types',
        'function processData() {',
        '  const data = { id: 1, name: "test" };',
        '  // Turbo-generated logs (should be detected)',
        '  console.log("🚀 ~ data:", data);',
        '  console.warn("🚀 ~ data warning ~ line:", data);',
        '  console.error("🚀 ~ data error ~ processData:", data);',
        '  myLogger("🚀 ~ custom log ~ processData:", data);',
        '',
        '  // Manual logs without Turbo patterns (should NOT be detected)',
        '  console.log("Manual log without prefix");',
        '  console.log("Just a debug message", data);',
        '  console.info("Info: processing started");',
        '  myLogger("Manual custom log without pattern");',
        '',
        '  // Logs with prefix but missing delimiter (should NOT be detected)',
        '  console.log("🚀 missing delimiter", data);',
        '  console.warn("🚀 another missing delimiter");',
        '  myLogger("🚀 custom without delimiter", data);',
        '',
        '  // Logs with delimiter but missing prefix (should NOT be detected)',
        '  console.log("missing prefix ~ data:", data);',
        '  console.error("~ no prefix here:", data);',
        '  myLogger("~ missing prefix but has delimiter:", data);',
        '',
        '  // More Turbo-generated logs (should be detected)',
        '  console.table("🚀 ~ tableData ~ processData:", data);',
        '  console.debug("🚀 ~ debugInfo ~ line 21:", { step: "final" });',
        '',
        '  // Multi-line Turbo log (should be detected)',
        '  console.log(',
        '    "🚀 ~ complexData ~ processData:",',
        '    data,',
        '    { additional: "info" }',
        '  );',
        '',
        '  // Multi-line manual log (should NOT be detected)',
        '  console.log(',
        '    "Manual multi-line log",',
        '    data',
        '  );',
        '',
        '  // Multi-line custom log with Turbo pattern (should be detected)',
        '  myLogger(',
        '    "🚀 ~ multiLineCustom ~ processData:",',
        '    data',
        '  );',
        '',
        '  // Edge case: prefix and delimiter in wrong order (should NOT be detected)',
        '  console.log("~ 🚀 wrong order:", data);',
        '  myLogger("~ 🚀 custom wrong order:", data);',
        '',
        '  // Another valid Turbo log (should be detected)',
        '  console.log("🚀 ~ finalResult ~ processData ~ line 45:", data);',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('  ');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction, // 'myLogger' - adds custom function to detection list
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect ALL log messages that match Turbo pattern (console.* + myLogger):
      // Line 4: console.log("🚀 ~ data:", data);
      // Line 5: console.warn("🚀 ~ data warning ~ line:", data);
      // Line 6: console.error("🚀 ~ data error ~ processData:", data);
      // Line 7: myLogger("🚀 ~ custom log ~ processData:", data);
      // Line 26: console.table("🚀 ~ tableData ~ processData:", data);
      // Line 27: console.debug("🚀 ~ debugInfo ~ line 21:", { step: "final" });
      // Lines 30-34: Multi-line console.log with Turbo pattern
      // Lines 43-46: Multi-line myLogger with Turbo pattern
      // Line 49: console.log("~ 🚀 wrong order:", data); - DETECTED because includes() finds both prefix and delimiter
      // Line 50: myLogger("~ 🚀 custom wrong order:", data); - DETECTED for same reason
      // Line 53: console.log("🚀 ~ finalResult ~ processData ~ line 45:", data);

      expect(result).toHaveLength(11);

      // Verify some key detections (in order of appearance):
      // First console.log
      expect(result[0].spaces).toBe('  ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(4);

      // console.warn
      expect(result[1].lines[0].start.line).toBe(5);

      // console.error
      expect(result[2].lines[0].start.line).toBe(6);

      // Custom myLogger
      expect(result[3].lines[0].start.line).toBe(7);

      // console.table
      expect(result[4].lines[0].start.line).toBe(26);

      // console.debug
      expect(result[5].lines[0].start.line).toBe(27);

      // Multi-line console.log
      expect(result[6].lines).toHaveLength(5);
      expect(result[6].lines[0].start.line).toBe(30);

      // Multi-line myLogger
      expect(result[7].lines).toHaveLength(4);
      expect(result[7].lines[0].start.line).toBe(43);

      // "Wrong order" logs (detected due to includes() logic)
      expect(result[8].lines[0].start.line).toBe(49);
      expect(result[9].lines[0].start.line).toBe(50);

      // Final console.log
      expect(result[10].lines[0].start.line).toBe(53);
    });

    it('should detect Turbo logs in useEffect with mixed manual logs', () => {
      const document = makeTextDocument([
        'useEffect(() => {',
        '    const firstFilterKey = activeFilters?.[0]?.key;',
        "    console.log('🚀 ~ 04.tsx:24 ~ DashboardFilters ~ firstFilterKey:', firstFilterKey);",
        "    console.error('🚀 ~ 04.tsx:24 ~ DashboardFilters ~ firstFilterKey:', firstFilterKey);",
        "    console.log('Auto-selected filter:', firstFilterKey)",
        '  }, [activeFilters])',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect only the 2 Turbo-generated logs (lines 2 and 3)
      // Line 4 is a manual log without Turbo pattern (missing prefix and delimiter)
      expect(result).toHaveLength(2);

      // First Turbo log: console.log with Turbo pattern
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2);

      // Second Turbo log: console.error with Turbo pattern
      expect(result[1].spaces).toBe('    ');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(3);

      // Verify that spacesBeforeLogMsg was called for each detected log
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(2);
    });
  });

  describe('Commented log messages', () => {
    it('should detect single-line commented Turbo log messages', () => {
      const document = makeTextDocument([
        'const x = 5;',
        '// console.log("🚀 ~ x:", x);',
        'const y = 10;',
        '// console.warn("🚀 ~ y:", y);',
        'return x + y;',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].lines[0].start.line).toBe(1); // // console.log
      expect(result[1].lines[0].start.line).toBe(3); // // console.warn
    });

    it('should detect both commented and uncommented Turbo logs in mixed document', () => {
      const document = makeTextDocument([
        'const x = 5;',
        'console.log("🚀 ~ x:", x);', // Should be detected (uncommented)
        '// console.log("🚀 ~ commented:", x);', // Should be detected (commented Turbo log)
        'const y = 10;',
        'console.warn("🚀 ~ y:", y);', // Should be detected (uncommented)
        '// console.error("🚀 ~ commented error:", y);', // Should be detected (commented Turbo log)
        'console.info("🚀 ~ info:", y);', // Should be detected (uncommented)
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(5);

      // Check that both commented and uncommented logs are detected
      expect(result[0].lines[0].start.line).toBe(1); // console.log (uncommented)
      expect(result[1].lines[0].start.line).toBe(2); // // console.log (commented)
      expect(result[2].lines[0].start.line).toBe(4); // console.warn (uncommented)
      expect(result[3].lines[0].start.line).toBe(5); // // console.error (commented)
      expect(result[4].lines[0].start.line).toBe(6); // console.info (uncommented)
    });

    it('should NOT detect commented logs without Turbo pattern', () => {
      const document = makeTextDocument([
        'const x = 5;',
        '// console.log("missing prefix ~", x);', // Missing prefix
        '// console.log("🚀 missing delimiter", x);', // Missing delimiter
        '// console.log("regular comment without pattern");', // No pattern at all
        'console.log("🚀 ~ valid:", x);', // Valid uncommented log
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);

      // Only the valid uncommented log should be detected
      expect(result[0].lines[0].start.line).toBe(4);
    });

    it('should detect commented custom log functions with Turbo pattern', () => {
      const document = makeTextDocument([
        'const data = { test: true };',
        '// myLogger("🚀 ~ data:", data);',
        'const result = process(data);',
        '// console.debug("🚀 ~ result:", result);',
        'return result;',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction, // 'myLogger'
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);

      // Both commented logs should be detected
      expect(result[0].lines[0].start.line).toBe(1); // // myLogger
      expect(result[1].lines[0].start.line).toBe(3); // // console.debug
    });

    // FIXME: Re-enable this test when inline comments are supported
    // it('should handle inline comments that do not comment out the log', () => {
    //   const document = makeTextDocument([
    //     'const x = 5;',
    //     'console.log("🚀 ~ x:", x); // This is a comment after the log',
    //     'const y = 10; // console.log("🚀 ~ fake:", y); - this is in a comment',
    //     'console.warn("🚀 ~ y:", y);',
    //   ]);

    //   mockSpacesBeforeLogMsg.mockReturnValue('');

    //   const result = detectAll(
    //     document,
    //     defaultExtensionProperties.logFunction,
    //     defaultExtensionProperties.logMessagePrefix,
    //     defaultExtensionProperties.delimiterInsideMessage,
    //   );

    //   expect(result).toHaveLength(3);

    //   // All three should be detected: 2 uncommented + 1 commented log in inline comment
    //   expect(result[0].lines[0].start.line).toBe(1); // console.log with trailing comment
    //   expect(result[1].lines[0].start.line).toBe(2); // commented log in inline comment
    //   expect(result[2].lines[0].start.line).toBe(3); // console.warn
    // });

    it('should detect commented logs with different spacing patterns', () => {
      const document = makeTextDocument([
        'function test() {',
        '  // console.log("🚀 ~ value:", value);',
        '  //console.warn("🚀 ~ warning:", warning);',
        '  //   console.error("🚀 ~ error:", error);',
        '  // myLogger("🚀 ~ custom:", custom);',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('  ');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction, // 'myLogger'
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4);

      // All commented logs with different spacing should be detected
      expect(result[0].lines[0].start.line).toBe(1); // //   console.log
      expect(result[1].lines[0].start.line).toBe(2); // //console.warn
      expect(result[2].lines[0].start.line).toBe(3); // //   console.error
      expect(result[3].lines[0].start.line).toBe(4); // //   myLogger
    });

    it('should detect multi-line commented log messages where each line starts with //', () => {
      const document = makeTextDocument([
        'const complexData = { a: 1, b: { c: 2 } };',
        '// console.log(',
        '//   "🚀 ~ complexData ~ multiLine:",',
        '//   complexData,',
        '//   { additional: "context" }',
        '// );',
        'const result = processData(complexData);',
        '// myLogger(',
        '//   "🚀 ~ result ~ processData:",',
        '//   result',
        '// );',
        'return result;',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction, // 'myLogger'
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect 2 multi-line log messages as complete blocks
      expect(result).toHaveLength(2);

      // First multi-line log: console.log block (lines 1-5)
      expect(result[0].lines).toHaveLength(5); // Full multi-line block
      expect(result[0].lines[0].start.line).toBe(1); // // console.log(
      expect(result[0].lines[1].start.line).toBe(2); // //   "🚀 ~ complexData ~ multiLine:",
      expect(result[0].lines[2].start.line).toBe(3); // //   complexData,
      expect(result[0].lines[3].start.line).toBe(4); // //   { additional: "context" }
      expect(result[0].lines[4].start.line).toBe(5); // // );

      // Second multi-line log: myLogger block (lines 7-10)
      expect(result[1].lines).toHaveLength(4); // Full multi-line block
      expect(result[1].lines[0].start.line).toBe(7); // // myLogger(
      expect(result[1].lines[1].start.line).toBe(8); // //   "🚀 ~ result ~ processData:",
      expect(result[1].lines[2].start.line).toBe(9); // //   result
      expect(result[1].lines[3].start.line).toBe(10); // // );

      // Check that spaces are calculated correctly
      expect(result[0].spaces).toBe('');
      expect(result[1].spaces).toBe('');
    });

    it('should detect mixed multi-line commented and uncommented log messages', () => {
      const document = makeTextDocument([
        'const data = { test: "value" };',
        'console.log("🚀 ~ data:", data);', // Active log - should be detected
        '// console.log(', // Start of commented multi-line log - no pattern
        '//   "🚀 ~ commented:",', // Middle of commented multi-line log - has pattern, should be detected
        '//   data', // Middle of commented multi-line log - no pattern
        '// );', // End of commented multi-line log - no pattern
        'const processed = transform(data);',
        'console.warn("🚀 ~ processed:", processed);', // Another active log - should be detected
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);

      // Check that both active and commented logs are detected in correct order
      expect(result[0].lines[0].start.line).toBe(1); // console.log (active)
      expect(result[1].lines).toHaveLength(4); // Multi-line commented log block (lines 2-5)
      expect(result[1].lines[0].start.line).toBe(2); // // console.log(
      expect(result[1].lines[1].start.line).toBe(3); // //   "🚀 ~ commented:",
      expect(result[1].lines[2].start.line).toBe(4); // //   data
      expect(result[1].lines[3].start.line).toBe(5); // // );
      expect(result[2].lines[0].start.line).toBe(7); // console.warn (active)

      // Verify the types of logs detected
      expect(result[0].lines).toHaveLength(1); // Single line active log
      expect(result[1].lines).toHaveLength(4); // Multi-line commented log block
      expect(result[2].lines).toHaveLength(1); // Single line active log
    });

    it('should NOT detect commented lines with Turbo pattern that are not log statements', () => {
      const document = makeTextDocument([
        'const data = { test: "value" };',
        '// This is a regular comment with 🚀 ~ pattern but no log function',
        '// const variable = "🚀 ~ someValue";',
        '// if (condition) { // 🚀 ~ check this }',
        'console.log("🚀 ~ data:", data);', // Should be detected (active log)
        '// console.log("🚀 ~ commented log:", data);', // Should be detected (commented log)
        '// Some other comment',
        '// return "🚀 ~ result";',
        'console.warn("🚀 ~ warning:", data);', // Should be detected (active log)
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should only detect actual log functions with Turbo pattern, not random comments
      expect(result).toHaveLength(3);

      // Check that only actual log statements are detected
      expect(result[0].lines[0].start.line).toBe(4); // console.log (active)
      expect(result[1].lines[0].start.line).toBe(5); // // console.log (commented)
      expect(result[2].lines[0].start.line).toBe(8); // console.warn (active)
    });

    it('should detect multi-line commented log ending at document boundary without explicit closing', () => {
      const document = makeTextDocument([
        'const processedUser = { id: 1, name: "John" };',
        '// console.log(',
        '//   "🚀 ~ multi-line log:",',
        '//   {',
        '//     data: processedUser,',
        '//     timestamp: new Date()',
        '//   }',
        '// );',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect one multi-line commented log block
      expect(result).toHaveLength(1);

      // Should include all lines from function start to closing parenthesis
      expect(result[0].lines).toHaveLength(7); // Lines 1-7 (8 lines total, 0-indexed)
      expect(result[0].lines[0].start.line).toBe(1); // // console.log(
      expect(result[0].lines[1].start.line).toBe(2); // //   "🚀 ~ multi-line log:",
      expect(result[0].lines[2].start.line).toBe(3); // //   {
      expect(result[0].lines[3].start.line).toBe(4); // //     data: processedUser,
      expect(result[0].lines[4].start.line).toBe(5); // //     timestamp: new Date()
      expect(result[0].lines[5].start.line).toBe(6); // //   }
      expect(result[0].lines[6].start.line).toBe(7); // // );

      expect(result[0].spaces).toBe('');
    });

    it('should detect multi-line commented log ending naturally without explicit closing', () => {
      const document = makeTextDocument([
        'const user = { id: 1, name: "John" };',
        '// console.log(',
        '//   "🚀 ~ multi-line log:",',
        '//   {',
        '//     data: user,',
        '//     timestamp: new Date()',
        '//   }',
        '// );',
        'const nextLine = "not commented";',
        'console.log("🚀 ~ regular log:", user);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');

      const result = detectAll(
        document,
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect 2 logs: the multi-line commented one and the regular one
      expect(result).toHaveLength(2);

      // First log: multi-line commented log (lines 1-6, ends when hitting non-commented line)
      expect(result[0].lines).toHaveLength(7); // Lines 1-6 (7 lines of comments)
      expect(result[0].lines[0].start.line).toBe(1); // // console.log(
      expect(result[0].lines[1].start.line).toBe(2); // //   "🚀 ~ multi-line log:",
      expect(result[0].lines[2].start.line).toBe(3); // //   {
      expect(result[0].lines[3].start.line).toBe(4); // //     data: user,
      expect(result[0].lines[4].start.line).toBe(5); // //     timestamp: new Date()
      expect(result[0].lines[5].start.line).toBe(6); // //   }
      expect(result[0].lines[6].start.line).toBe(7); // // );

      // Second log: regular active log
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(9); // console.log("🚀 ~ regular log:", user);
    });
  });
});
