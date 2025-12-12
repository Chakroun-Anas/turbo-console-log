import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';
import * as vscode from 'vscode';
import * as fs from 'fs';

jest.mock('@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg', () => ({
  spacesBeforeLogMsg: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const mockSpacesBeforeLogMsg = spacesBeforeLogMsg as jest.MockedFunction<
  typeof spacesBeforeLogMsg
>;

const mockFsReadFile = fs.promises.readFile as jest.MockedFunction<
  typeof fs.promises.readFile
>;

const mockVscodeOpenTextDocument = vscode.workspace
  .openTextDocument as jest.MockedFunction<
  typeof vscode.workspace.openTextDocument
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
    it('should return empty array when no log messages are found', async () => {
      const document = makeTextDocument([
        'const x = 5;',
        'function test() {',
        '  return x;',
        '}',
      ]);

      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect single-line log message with prefix and delimiter', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  const x = 5;',
        '  console.log("🚀 ~ x:", x);',
        '  return x;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[0].lines[0].end.line).toBe(2);
    });

    it('should detect multi-line log message', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  const complexObj = { a: 1, b: 2 };',
        '  console.log(',
        '    "🚀 ~ complexObj:",',
        '    complexObj',
        '  );',
        '  return complexObj;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(4); // Lines 2-5 (0-indexed)
      expect(result[0].spaces).toBe('');
      // Check that we're capturing the correct range of lines
      expect(result[0].lines[0].start.line).toBe(2); // console.log(
      expect(result[0].lines[1].start.line).toBe(3); // "🚀 ~ complexObj:",
      expect(result[0].lines[2].start.line).toBe(4); // complexObj
      expect(result[0].lines[3].start.line).toBe(5); // );
    });
  });

  describe('Message validation', () => {
    it('should include log message without required prefix but mark as non-Turbo', async () => {
      const document = makeTextDocument([
        'console.log("missing prefix ~", x);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });

    it('should include log message without required delimiter but mark as non-Turbo', async () => {
      const document = makeTextDocument([
        'console.log("🚀 x missing delimiter", x);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });
  });

  describe('Different log functions', () => {
    it('should detect console.warn messages', async () => {
      const document = makeTextDocument([
        'console.warn("🚀 ~ warning:", data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        'console.warn',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should detect console.error messages', async () => {
      const document = makeTextDocument([
        'console.error("🚀 ~ error:", error);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        'console.error',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle custom log functions', async () => {
      const document = makeTextDocument([
        'logger.debug("🚀 ~ debug:", debugInfo);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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
    it('should handle regex special characters in log function name', async () => {
      const document = makeTextDocument(['$log.info("🚀 ~ info:", info);']);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        '$log.info',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle regex special characters in prefix', async () => {
      const document = makeTextDocument([
        'console.log("[DEBUG] ~ value:", value);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        '[DEBUG]',
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should handle regex special characters in delimiter', async () => {
      const document = makeTextDocument(['console.log("🚀 | value:", value);']);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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
    it('should detect multiple log messages in the same document', async () => {
      const document = makeTextDocument([
        'const x = 5;',
        'console.log("🚀 ~ x:", x);',
        'const y = 10;',
        'console.log("🚀 ~ y:", y);',
        'const z = x + y;',
        'console.log("🚀 ~ z:", z);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should detect some but not all log messages based on validation', async () => {
      const document = makeTextDocument([
        'console.log("🚀 ~ valid:", x);',
        'console.log("missing prefix ~ y:", y);',
        'console.log("🚀 z:", z);',
        'console.log("🚀 ~ valid too:", a);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4); // All 4 logs detected

      // Lines 0 and 3 are Turbo logs (have both prefix and delimiter)
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
      expect(result[0].isTurboConsoleLog).toBe(true);

      // Line 1 is not a Turbo log (missing prefix)
      expect(result[1].lines[0].start.line).toBe(1);
      expect(result[1].isTurboConsoleLog).toBe(false);

      // Line 2 is not a Turbo log (missing delimiter)
      expect(result[2].lines[0].start.line).toBe(2);
      expect(result[2].isTurboConsoleLog).toBe(false);

      // Line 3 is a Turbo log
      expect(result[3].spaces).toBe('');
      expect(result[3].lines).toHaveLength(1);
      expect(result[3].lines[0].start.line).toBe(3);
      expect(result[3].isTurboConsoleLog).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty document', async () => {
      const document = makeTextDocument([]);

      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle document with only whitespace', async () => {
      const document = makeTextDocument(['   ', '', '  \t  ']);

      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle log messages at the beginning and end of document', async () => {
      const document = makeTextDocument([
        'console.log("🚀 ~ start:", start);',
        'const middle = "code";',
        'console.log("🚀 ~ end:", end);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should handle multi-line log message at end of document', async () => {
      const document = makeTextDocument([
        'const data = { x: 1 };',
        'console.log(',
        '  "🚀 data ~",',
        '  data',
        ');',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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
    it('should handle nested function calls with log messages', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should handle log messages in different contexts (classes, functions, etc.)', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].lines[0].start.line).toBe(2); // constructor log
      expect(result[1].lines[0].start.line).toBe(6); // method log
    });

    it('should correctly differentiate between Turbo-generated and manual logs in mixed document', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction, // 'myLogger' - adds custom function to detection list
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect ALL log messages (22 total: 11 Turbo logs + 11 non-Turbo logs)
      // Turbo logs (isTurboConsoleLog: true) have both 🚀 prefix and ~ delimiter
      // Non-Turbo logs (isTurboConsoleLog: false) are missing either prefix or delimiter or both

      expect(result).toHaveLength(22);

      // Count Turbo vs non-Turbo logs
      const turboLogs = result.filter((msg) => msg.isTurboConsoleLog === true);
      const nonTurboLogs = result.filter(
        (msg) => msg.isTurboConsoleLog === false,
      );
      expect(turboLogs).toHaveLength(11);
      expect(nonTurboLogs).toHaveLength(11);

      // Verify some key Turbo log detections by line number
      // First Turbo log: console.log at line 4
      const firstTurboLog = turboLogs.find(
        (log) => log.lines[0].start.line === 4,
      );
      expect(firstTurboLog).toBeDefined();
      expect(firstTurboLog!.spaces).toBe('  ');
      expect(firstTurboLog!.lines).toHaveLength(1);

      // console.warn at line 5
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 5),
      ).toBeDefined();

      // console.error at line 6
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 6),
      ).toBeDefined();

      // Custom myLogger at line 7
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 7),
      ).toBeDefined();

      // console.table at line 26
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 26),
      ).toBeDefined();

      // console.debug at line 27
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 27),
      ).toBeDefined();

      // Multi-line console.log starting at line 30
      const multiLineLog = turboLogs.find(
        (log) => log.lines[0].start.line === 30,
      );
      expect(multiLineLog).toBeDefined();
      expect(multiLineLog!.lines).toHaveLength(5);

      // Multi-line myLogger starting at line 43
      const multiLineMyLogger = turboLogs.find(
        (log) => log.lines[0].start.line === 43,
      );
      expect(multiLineMyLogger).toBeDefined();
      expect(multiLineMyLogger!.lines).toHaveLength(4);

      // Final console.log at line 53
      expect(
        turboLogs.find((log) => log.lines[0].start.line === 53),
      ).toBeDefined();
    });

    it('should detect Turbo logs in useEffect with mixed manual logs', async () => {
      const document = makeTextDocument([
        'useEffect(() => {',
        '    const firstFilterKey = activeFilters?.[0]?.key;',
        "    console.log('🚀 ~ 04.tsx:24 ~ DashboardFilters ~ firstFilterKey:', firstFilterKey);",
        "    console.error('🚀 ~ 04.tsx:24 ~ DashboardFilters ~ firstFilterKey:', firstFilterKey);",
        "    console.log('Auto-selected filter:', firstFilterKey)",
        '  }, [activeFilters])',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect all 3 logs: 2 Turbo logs (lines 2, 3) + 1 manual log (line 4)
      expect(result).toHaveLength(3);

      // First Turbo log: console.log with Turbo pattern
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[0].isTurboConsoleLog).toBe(true);

      // Second Turbo log: console.error with Turbo pattern
      expect(result[1].spaces).toBe('    ');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(3);
      expect(result[1].isTurboConsoleLog).toBe(true);

      // Third is a manual log without Turbo pattern
      expect(result[2].lines[0].start.line).toBe(4);
      expect(result[2].isTurboConsoleLog).toBe(false);

      // Verify that spacesBeforeLogMsg was called for each detected log
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(3);
    });
  });

  describe('Commented log messages', () => {
    it('should detect single-line commented Turbo log messages', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  const x = 5;',
        '  // console.log("🚀 ~ x:", x);',
        '  const y = 10;',
        '  // console.warn("🚀 ~ y:", y);',
        '  return x + y;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].lines[0].start.line).toBe(2); // // console.log
      expect(result[1].lines[0].start.line).toBe(4); // // console.warn
    });

    it('should detect both commented and uncommented Turbo logs in mixed document', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should detect all commented logs including those without Turbo pattern', async () => {
      const document = makeTextDocument([
        'const x = 5;',
        '// console.log("missing prefix ~", x);', // Missing prefix
        '// console.log("🚀 missing delimiter", x);', // Missing delimiter
        '// console.log("regular comment without pattern");', // No pattern at all
        'console.log("🚀 ~ valid:", x);', // Valid uncommented log
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4); // 3 commented + 1 uncommented

      // Commented logs without Turbo pattern
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
      expect(result[1].lines[0].start.line).toBe(2);
      expect(result[1].isTurboConsoleLog).toBe(false);
      expect(result[2].lines[0].start.line).toBe(3);
      expect(result[2].isTurboConsoleLog).toBe(false);

      // Valid uncommented Turbo log
      expect(result[3].lines[0].start.line).toBe(4);
      expect(result[3].isTurboConsoleLog).toBe(true);
    });

    it('should detect commented custom log functions with Turbo pattern', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  const data = { test: true };',
        '  // myLogger("🚀 ~ data:", data);',
        '  const result = process(data);',
        '  // console.debug("🚀 ~ result:", result);',
        '  return result;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction, // 'myLogger'
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);

      // Both commented logs should be detected
      expect(result[0].lines[0].start.line).toBe(2); // // myLogger
      expect(result[1].lines[0].start.line).toBe(4); // // console.debug
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

    it('should detect commented logs with different spacing patterns', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  // console.log("🚀 ~ value:", value);',
        '  //console.warn("🚀 ~ warning:", warning);',
        '  //   console.error("🚀 ~ error:", error);',
        '  // myLogger("🚀 ~ custom:", custom);',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('  ');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should detect multi-line commented log messages where each line starts with //', async () => {
      const document = makeTextDocument([
        'function test() {',
        '  const complexData = { a: 1, b: { c: 2 } };',
        '  // console.log(',
        '  //   "🚀 ~ complexData ~ multiLine:",',
        '  //   complexData,',
        '  //   { additional: "context" }',
        '  // );',
        '  const result = processData(complexData);',
        '  // myLogger(',
        '  //   "🚀 ~ result ~ processData:",',
        '  //   result',
        '  // );',
        '  return result;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction, // 'myLogger'
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect 2 multi-line log messages as complete blocks
      expect(result).toHaveLength(2);

      // First multi-line log: console.log block (lines 2-6)
      expect(result[0].lines).toHaveLength(5); // Full multi-line block
      expect(result[0].lines[0].start.line).toBe(2); // // console.log(
      expect(result[0].lines[1].start.line).toBe(3); // //   "🚀 ~ complexData ~ multiLine:",
      expect(result[0].lines[2].start.line).toBe(4); // //   complexData,
      expect(result[0].lines[3].start.line).toBe(5); // //   { additional: "context" }
      expect(result[0].lines[4].start.line).toBe(6); // // );

      // Second multi-line log: myLogger block (lines 8-11)
      expect(result[1].lines).toHaveLength(4); // Full multi-line block
      expect(result[1].lines[0].start.line).toBe(8); // // myLogger(
      expect(result[1].lines[1].start.line).toBe(9); // //   "🚀 ~ result ~ processData:",
      expect(result[1].lines[2].start.line).toBe(10); // //   result
      expect(result[1].lines[3].start.line).toBe(11); // // );

      // Check that spaces are calculated correctly
      expect(result[0].spaces).toBe('');
      expect(result[1].spaces).toBe('');
    });

    it('should detect mixed multi-line commented and uncommented log messages', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should NOT detect commented lines with Turbo pattern that are not log statements', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should detect multi-line commented log ending at document boundary without explicit closing', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

    it('should detect multi-line commented log ending naturally without explicit closing', async () => {
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
      mockFsReadFile.mockResolvedValue(document.getText());
      mockVscodeOpenTextDocument.mockResolvedValue(document);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
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

  describe('Error handling', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return empty array and log error when fs.readFile fails', async () => {
      const readError = new Error('ENOENT: no such file or directory');
      mockFsReadFile.mockRejectedValue(readError);

      const result = await detectAll(
        fs,
        vscode,
        '/non/existent/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to detect logs in file "/non/existent/file.ts":',
        'ENOENT: no such file or directory',
      );
      expect(mockVscodeOpenTextDocument).not.toHaveBeenCalled();
    });

    it('should return empty array and log error when openTextDocument fails', async () => {
      const document = makeTextDocument(['console.log("🚀 ~ test:", x);']);

      mockFsReadFile.mockResolvedValue(document.getText());

      const openDocError = new Error('Failed to open document');
      mockVscodeOpenTextDocument.mockRejectedValue(openDocError);

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.ts',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to detect logs in file "/test/file.ts":',
        'Failed to open document',
      );
      expect(mockFsReadFile).toHaveBeenCalledWith('/test/file.ts', 'utf8');
      expect(mockVscodeOpenTextDocument).toHaveBeenCalled();
    });
  });
});
