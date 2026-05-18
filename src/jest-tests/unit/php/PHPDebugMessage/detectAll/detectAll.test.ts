import { detectAll } from '@/debug-message/php/PHPDebugMessage/detectAll';
import { spacesBeforeLogMsg } from '@/debug-message/php/PHPDebugMessage/msg/spacesBeforeLogMsg';
import { ExtensionProperties } from '@/entities';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';
import * as fs from 'fs';

jest.mock(
  '@/debug-message/php/PHPDebugMessage/msg/spacesBeforeLogMsg',
  () => ({
    spacesBeforeLogMsg: jest.fn(),
  }),
);

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const mockSpacesBeforeLogMsg = spacesBeforeLogMsg as jest.MockedFunction<
  typeof spacesBeforeLogMsg
>;

const mockFsReadFileSync = fs.readFileSync as jest.MockedFunction<
  typeof fs.readFileSync
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
    logFunction: 'error_log',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return empty array when no log messages are found', async () => {
      const document = makeTextDocument([
        '<?php',
        '$x = 5;',
        'function test() {',
        '  return $x;',
        '}',
      ]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect single-line error_log message with prefix and delimiter', async () => {
      const document = makeTextDocument([
        '<?php',
        'function test() {',
        '  $x = 5;',
        '  error_log("🚀 ~ x: " . print_r($x, true));',
        '  return $x;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(3);
      expect(result[0].lines[0].end.line).toBe(4); // Extends to next line (includes \n)
    });

    it('should detect multi-line error_log message', async () => {
      const document = makeTextDocument([
        '<?php',
        'function test() {',
        '  $complexObj = ["a" => 1, "b" => 2];',
        '  error_log(',
        '    "🚀 ~ complexObj: " .',
        '    print_r($complexObj, true)',
        '  );',
        '  return $complexObj;',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2); // Multiline Turbo log + print_r line detected separately

      // First is the complete multiline Turbo log
      expect(result[0].lines).toHaveLength(4); // Lines 3-6 (0-indexed)
      expect(result[0].spaces).toBe('');
      expect(result[0].isTurboConsoleLog).toBe(true);
      expect(result[0].lines[0].start.line).toBe(3); // error_log(
      expect(result[0].lines[1].start.line).toBe(4); // "🚀 ~ complexObj: " .
      expect(result[0].lines[2].start.line).toBe(5); // print_r($complexObj, true)
      expect(result[0].lines[3].start.line).toBe(6); // );

      // Second is the print_r line detected separately as non-Turbo
      expect(result[1].lines[0].start.line).toBe(5);
      expect(result[1].isTurboConsoleLog).toBe(false);
    });
  });

  describe('Message validation', () => {
    it('should include log message without required prefix but mark as non-Turbo', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("missing prefix ~ " . print_r($x, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });

    it('should include log message without required delimiter but mark as non-Turbo', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 x missing delimiter: " . print_r($x, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });
  });

  describe('Different log functions', () => {
    it('should detect var_dump messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'var_dump("🚀 ~ data: ", $data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'var_dump',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should detect print_r messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'print_r(["🚀 ~ error: " => $error]);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'print_r',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should handle custom log functions', async () => {
      const document = makeTextDocument([
        '<?php',
        'Logger::debug("🚀 ~ debug: " . print_r($debugInfo, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'Logger::debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });
  });

  describe('Special characters handling', () => {
    it('should handle regex special characters in log function name', async () => {
      const document = makeTextDocument([
        '<?php',
        '$log->info("🚀 ~ info: " . print_r($info, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        '$log->info',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should handle regex special characters in prefix', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("[DEBUG] ~ value: " . print_r($value, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        '[DEBUG]',
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should handle regex special characters in delimiter', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 | value: " . print_r($value, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        '|',
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });
  });

  describe('Multiple log messages', () => {
    it('should detect multiple log messages in the same document', async () => {
      const document = makeTextDocument([
        '<?php',
        '$x = 5;',
        'error_log("🚀 ~ x: " . print_r($x, true));',
        '$y = 10;',
        'error_log("🚀 ~ y: " . print_r($y, true));',
        '$z = $x + $y;',
        'error_log("🚀 ~ z: " . print_r($z, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(3);

      // Check individual log messages
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2); // First log message

      expect(result[1].spaces).toBe('');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(4); // Second log message

      expect(result[2].spaces).toBe('');
      expect(result[2].lines).toHaveLength(1);
      expect(result[2].lines[0].start.line).toBe(6); // Third log message
    });

    it('should detect some but not all log messages based on validation', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ valid: " . print_r($x, true));',
        'error_log("missing prefix ~ " . print_r($y, true));',
        'error_log("🚀 missing delimiter: " . print_r($z, true));',
        'error_log("🚀 ~ valid too: " . print_r($a, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4); // All 4 logs detected

      // Lines 1 and 4 are Turbo logs (have both prefix and delimiter)
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[0].isTurboConsoleLog).toBe(true);

      // Line 2 is not a Turbo log (missing prefix)
      expect(result[1].lines[0].start.line).toBe(2);
      expect(result[1].isTurboConsoleLog).toBe(false);

      // Line 3 is not a Turbo log (missing delimiter)
      expect(result[2].lines[0].start.line).toBe(3);
      expect(result[2].isTurboConsoleLog).toBe(false);

      // Line 4 is a Turbo log
      expect(result[3].spaces).toBe('');
      expect(result[3].lines).toHaveLength(1);
      expect(result[3].lines[0].start.line).toBe(4);
      expect(result[3].isTurboConsoleLog).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty document', async () => {
      const document = makeTextDocument([]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle document with only whitespace', async () => {
      const document = makeTextDocument(['   ', '', '  \t  ']);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should handle log messages at the beginning and end of document', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ start: " . print_r($start, true));',
        '$middle = "code";',
        'error_log("🚀 ~ end: " . print_r($end, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);

      // Check individual log messages
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1); // First log message

      expect(result[1].spaces).toBe('');
      expect(result[1].lines).toHaveLength(1);
      expect(result[1].lines[0].start.line).toBe(3); // Second log message
    });

    it('should handle multi-line log message at end of document', async () => {
      const document = makeTextDocument([
        '<?php',
        '$data = ["x" => 1];',
        'error_log(',
        '  "🚀 ~ data: " .',
        '  print_r($data, true)',
        ');',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2); // Multiline Turbo log + print_r line detected separately

      // First is the complete multiline Turbo log
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].spaces).toBe('');
      expect(result[0].isTurboConsoleLog).toBe(true);
      expect(result[0].lines[0].start.line).toBe(2); // error_log(
      expect(result[0].lines[1].start.line).toBe(3); // "🚀 ~ data: " .
      expect(result[0].lines[2].start.line).toBe(4); // print_r($data, true)
      expect(result[0].lines[3].start.line).toBe(5); // );

      // Second is the print_r line detected separately as non-Turbo
      expect(result[1].lines[0].start.line).toBe(4);
      expect(result[1].isTurboConsoleLog).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle nested function calls with log messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'function outer() {',
        '  $x = 5;',
        '  error_log("🚀 ~ x: " . print_r($x, true));',
        '  function inner() {',
        '    $y = 10;',
        '    error_log("🚀 ~ y: " . print_r($y, true));',
        '  }',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('  ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(2);

      // Both messages should have the correct indentation
      expect(result[0].spaces).toBe('  ');
      expect(result[0].lines[0].start.line).toBe(3);

      expect(result[1].spaces).toBe('  ');
      expect(result[1].lines[0].start.line).toBe(6);
    });

    it('should handle log messages in different contexts (classes, functions, etc.)', async () => {
      const document = makeTextDocument([
        '<?php',
        'class MyClass {',
        '  public function method() {',
        '    $data = "test";',
        '    error_log("🚀 ~ data: " . print_r($data, true));',
        '  }',
        '}',
        '',
        'function standalone() {',
        '  $value = 42;',
        '  error_log("🚀 ~ value: " . print_r($value, true));',
        '}',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].lines[0].start.line).toBe(4); // Class method log
      expect(result[1].lines[0].start.line).toBe(10); // Standalone function log
    });

    it('should correctly differentiate between Turbo-generated and manual logs in mixed document', async () => {
      const document = makeTextDocument([
        '<?php',
        '// Manual debug log without Turbo pattern',
        'error_log("Debug info: " . $x);',
        '',
        '// Turbo-generated log',
        'error_log("🚀 ~ x: " . print_r($x, true));',
        '',
        '// Another manual log',
        'error_log("Error occurred");',
        '',
        '// Another Turbo log',
        'error_log("🚀 ~ y: " . print_r($y, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect all 4 logs (2 Turbo + 2 manual)
      expect(result).toHaveLength(4);

      // Line 2: Manual log (no Turbo pattern)
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[0].isTurboConsoleLog).toBe(false);

      // Line 5: Turbo log
      expect(result[1].lines[0].start.line).toBe(5);
      expect(result[1].isTurboConsoleLog).toBe(true);

      // Line 8: Manual log (no Turbo pattern)
      expect(result[2].lines[0].start.line).toBe(8);
      expect(result[2].isTurboConsoleLog).toBe(false);

      // Line 11: Turbo log
      expect(result[3].lines[0].start.line).toBe(11);
      expect(result[3].isTurboConsoleLog).toBe(true);
    });
  });

  describe('Commented log messages', () => {
    it('should detect single-line commented Turbo log messages with // comment', async () => {
      const document = makeTextDocument([
        '<?php',
        '$x = 5;',
        '// error_log("🚀 ~ x: " . print_r($x, true));',
        'return $x;',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(2);
    });

    it('should detect single-line commented Turbo log messages with # comment', async () => {
      const document = makeTextDocument([
        '<?php',
        '$x = 5;',
        '# error_log("🚀 ~ x: " . print_r($x, true));',
        'return $x;',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(2);
    });

    it('should detect both commented and uncommented Turbo logs in mixed document', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ x: " . print_r($x, true));',
        '// error_log("🚀 ~ y: " . print_r($y, true));',
        'error_log("🚀 ~ z: " . print_r($z, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);

      // First log is not commented
      expect(result[0].isCommented).toBeUndefined();
      expect(result[0].lines[0].start.line).toBe(1);

      // Second log is commented
      expect(result[1].isCommented).toBe(true);
      expect(result[1].lines[0].start.line).toBe(2);

      // Third log is not commented
      expect(result[2].isCommented).toBeUndefined();
      expect(result[2].lines[0].start.line).toBe(3);
    });

    it('should detect all commented logs including those without Turbo pattern', async () => {
      const document = makeTextDocument([
        '<?php',
        '// error_log("Regular debug message");',
        '// error_log("Another message without pattern");',
        '# error_log("Missing delimiter 🚀");',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3); // All 3 commented logs detected
      expect(result[0].isTurboConsoleLog).toBe(false);
      expect(result[1].isTurboConsoleLog).toBe(false);
      expect(result[2].isTurboConsoleLog).toBe(false);
    });

    it('should detect commented custom log functions with Turbo pattern', async () => {
      const document = makeTextDocument([
        '<?php',
        '// Logger::debug("🚀 ~ value: " . print_r($value, true));',
        '# Logger::debug("🚀 ~ data: " . print_r($data, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'Logger::debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[1].isCommented).toBe(true);
      expect(result[1].lines[0].start.line).toBe(2);
    });

    it('should detect commented logs with different spacing patterns', async () => {
      const document = makeTextDocument([
        '<?php',
        '//error_log("🚀 ~ x: " . print_r($x, true));',
        '  //  error_log("🚀 ~ y: " . print_r($y, true));',
        '#    error_log("🚀 ~ z: " . print_r($z, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[1].isCommented).toBe(true);
      expect(result[1].lines[0].start.line).toBe(2);
      expect(result[2].isCommented).toBe(true);
      expect(result[2].lines[0].start.line).toBe(3);
    });

    it('should NOT detect commented lines with Turbo pattern that are not log statements', async () => {
      const document = makeTextDocument([
        '<?php',
        '// This is a comment about error_log with "🚀 ~ pattern"',
        '// Some other comment mentioning the prefix 🚀 and delimiter ~',
        '$x = 5; // inline comment with error_log("🚀 ~ fake")',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(0);
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

    it('should return empty array and log error when fs.readFileSync fails', async () => {
      const error = new Error('File not found');
      mockFsReadFileSync.mockImplementation(() => {
        throw error;
      });

      const result = await detectAll(
        fs,
        vscode,
        '/test/nonexistent.php',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to detect logs in file "/test/nonexistent.php":',
        'File not found',
      );
    });
  });

  describe('logFunction property tracking', () => {
    it('should set logFunction to error_log for error_log messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ x: " . print_r($x, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction to var_dump for var_dump messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'var_dump("🚀 ~ data: ", $data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'var_dump',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('var_dump');
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction to print_r for print_r messages', async () => {
      const document = makeTextDocument([
        '<?php',
        'print_r(["🚀 ~ error: " => $error]);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'print_r',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('print_r');
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction for commented PHP logs', async () => {
      const document = makeTextDocument([
        '<?php',
        '// error_log("🚀 ~ x: " . print_r($x, true));',
        '# var_dump("🚀 ~ data: ", $data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].isCommented).toBe(true);
      expect(result[0].isTurboConsoleLog).toBe(true);

      expect(result[1].logFunction).toBe('var_dump');
      expect(result[1].isCommented).toBe(true);
      expect(result[1].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction for multi-line PHP logs', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log(',
        '  "🚀 ~ complexData: " .',
        '  print_r($complexData, true)',
        ');',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // First is the multiline error_log, second is print_r detected separately
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].lines.length).toBeGreaterThan(1);
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction for mixed PHP log functions in same file', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ a: " . print_r($a, true));',
        'var_dump("🚀 ~ b: ", $b);',
        'print_r(["🚀 ~ c: " => $c]);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[1].logFunction).toBe('var_dump');
      expect(result[2].logFunction).toBe('print_r');
    });

    it('should set logFunction for custom PHP log functions', async () => {
      const document = makeTextDocument([
        '<?php',
        'Logger::debug("🚀 ~ info: " . print_r($info, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'Logger::debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('Logger::debug');
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should set logFunction even for non-Turbo logs (missing prefix/delimiter)', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("regular log without turbo markers");',
        'var_dump($data);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].isTurboConsoleLog).toBe(false);
      expect(result[1].logFunction).toBe('var_dump');
      expect(result[1].isTurboConsoleLog).toBe(false);
    });

    it('should correctly identify error_log when print_r is nested inside on same line', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ data: " . print_r($data, true));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should only detect error_log, not the nested print_r
      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].isTurboConsoleLog).toBe(true);
      expect(result[0].lines).toHaveLength(1);
    });

    it('should correctly identify both error_log and print_r when on separate lines', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log(',
        '  "🚀 ~ data: " .',
        '  print_r($data, true)',
        ');',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // First result: error_log multi-line (the main log function)
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].isTurboConsoleLog).toBe(true);
      expect(result[0].lines.length).toBeGreaterThan(1);

      // Second result: print_r on its own line (detected separately but part of error_log)
      // This is detected because print_r starts a line, but it's actually inside error_log
      if (result.length > 1) {
        expect(result[1].logFunction).toBe('print_r');
        expect(result[1].lines[0].start.line).toBe(3); // Line with print_r
      }
    });

    it('should use the outermost log function name for nested calls', async () => {
      const document = makeTextDocument([
        '<?php',
        'var_dump("Outer: ", error_log("🚀 ~ nested: " . print_r($x, true)));',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'var_dump',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      // Should detect var_dump as the main function (starts the line)
      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('var_dump');
      expect(result[0].lines).toHaveLength(1);
    });

    it('should handle multiple error_log calls with nested print_r correctly', async () => {
      const document = makeTextDocument([
        '<?php',
        'error_log("🚀 ~ a: " . print_r($a, true));',
        'error_log("🚀 ~ b: " . print_r($b, true));',
        'var_dump("🚀 ~ c: ", $c);',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.php',
        'error_log',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);

      // All three should have correct logFunction based on line start
      expect(result[0].logFunction).toBe('error_log');
      expect(result[0].lines[0].start.line).toBe(1);

      expect(result[1].logFunction).toBe('error_log');
      expect(result[1].lines[0].start.line).toBe(2);

      expect(result[2].logFunction).toBe('var_dump');
      expect(result[2].lines[0].start.line).toBe(3);
    });
  });
});
