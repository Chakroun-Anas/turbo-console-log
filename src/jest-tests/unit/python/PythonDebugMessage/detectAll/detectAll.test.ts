import { detectAll } from '@/debug-message/python/detectAll';
import { spacesBeforeLogMsg } from '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg/spacesBeforeLogMsg';
import { ExtensionProperties } from '@/entities';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';
import * as fs from 'fs';

jest.mock(
  '@/debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg/spacesBeforeLogMsg',
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

describe('detectAll (Python)', () => {
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
    logFunction: 'print',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return empty array when no log messages are found', async () => {
      const document = makeTextDocument([
        'def greet(name):',
        '    return f"Hello, {name}"',
        '',
        'result = greet("world")',
      ]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect a single-line print with Turbo markers', async () => {
      const document = makeTextDocument([
        'def test():',
        '    x = 5',
        '    print("🚀 ~ x:", x)',
        '    return x',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('');
      expect(result[0].lines).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[0].lines[0].end.line).toBe(3);
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should detect a multi-line print call', async () => {
      const document = makeTextDocument([
        'def test():',
        '    obj = {"a": 1, "b": 2}',
        '    print(',
        '        "🚀 ~ obj:",',
        '        obj',
        '    )',
        '    return obj',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].lines[0].start.line).toBe(2); // print(
      expect(result[0].lines[1].start.line).toBe(3); // "🚀 ~ obj:",
      expect(result[0].lines[2].start.line).toBe(4); // obj
      expect(result[0].lines[3].start.line).toBe(5); // )
    });
  });

  describe('All Python log functions', () => {
    it('should detect logging.debug messages', async () => {
      const document = makeTextDocument([
        'import logging',
        'logging.debug("🚀 ~ value:", value)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logging.debug');
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should detect logging.info messages', async () => {
      const document = makeTextDocument([
        'import logging',
        'logging.info("🚀 ~ status:", status)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.info',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logging.info');
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should detect logging.warning messages', async () => {
      const document = makeTextDocument([
        'import logging',
        'logging.warning("🚀 ~ issue:", issue)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.warning',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logging.warning');
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should detect logging.error messages', async () => {
      const document = makeTextDocument([
        'import logging',
        'logging.error("🚀 ~ err:", err)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.error',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logging.error');
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should detect a custom log function', async () => {
      const document = makeTextDocument([
        'logger.debug("🚀 ~ data:", data)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logger.debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logger.debug');
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should detect all known Python log functions in the same file', async () => {
      const document = makeTextDocument([
        'import logging',
        'print("🚀 ~ x:", x)',
        'logging.debug("🚀 ~ y:", y)',
        'logging.info("🚀 ~ z:", z)',
        'logging.warning("🚀 ~ w:", w)',
        'logging.error("🚀 ~ e:", e)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(5);
      expect(result[0].logFunction).toBe('print');
      expect(result[1].logFunction).toBe('logging.debug');
      expect(result[2].logFunction).toBe('logging.info');
      expect(result[3].logFunction).toBe('logging.warning');
      expect(result[4].logFunction).toBe('logging.error');
    });
  });

  describe('Turbo vs non-Turbo markers', () => {
    it('should mark log with both prefix and delimiter as isTurboConsoleLog: true', async () => {
      const document = makeTextDocument([
        'print("🚀 ~ variable:", variable)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should mark log missing prefix as isTurboConsoleLog: false', async () => {
      const document = makeTextDocument([
        'print("missing prefix ~ variable:", variable)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });

    it('should mark log missing delimiter as isTurboConsoleLog: false', async () => {
      const document = makeTextDocument([
        'print("🚀 no delimiter here", variable)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(false);
    });
  });

  describe('Commented log messages — Python uses # exclusively', () => {
    it('should detect a single-line commented print with # syntax', async () => {
      const document = makeTextDocument([
        'def test():',
        '    x = 5',
        '    # print("🚀 ~ x:", x)',
        '    return x',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[0].isTurboConsoleLog).toBe(true);
    });

    it('should detect commented logging.debug with # syntax', async () => {
      const document = makeTextDocument([
        'import logging',
        '# logging.debug("🚀 ~ value:", value)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].logFunction).toBe('logging.debug');
    });

    it('should detect both commented and uncommented logs in the same file', async () => {
      const document = makeTextDocument([
        'x = 5',
        'print("🚀 ~ x:", x)',
        '# print("🚀 ~ commented:", x)',
        'y = 10',
        'logging.debug("🚀 ~ y:", y)',
        '# logging.debug("🚀 ~ commented y:", y)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4);

      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[0].isCommented).toBeUndefined();

      expect(result[1].lines[0].start.line).toBe(2);
      expect(result[1].isCommented).toBe(true);

      expect(result[2].lines[0].start.line).toBe(4);
      expect(result[2].isCommented).toBeUndefined();

      expect(result[3].lines[0].start.line).toBe(5);
      expect(result[3].isCommented).toBe(true);
    });

    it('should handle # comments with varying spacing', async () => {
      const document = makeTextDocument([
        '#print("🚀 ~ a:", a)',
        '# print("🚀 ~ b:", b)',
        '#   print("🚀 ~ c:", c)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines[0].start.line).toBe(0);
      expect(result[1].isCommented).toBe(true);
      expect(result[1].lines[0].start.line).toBe(1);
      expect(result[2].isCommented).toBe(true);
      expect(result[2].lines[0].start.line).toBe(2);
    });

    it('should NOT detect // as a Python comment — only # is valid', async () => {
      const document = makeTextDocument([
        '// print("🚀 ~ value:", value)',
      ]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect a multi-line commented log where each line starts with #', async () => {
      const document = makeTextDocument([
        'data = {"key": "value"}',
        '# print(',
        '#     "🚀 ~ data:",',
        '#     data',
        '# )',
        'result = process(data)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isCommented).toBe(true);
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].lines[0].start.line).toBe(1); // # print(
      expect(result[0].lines[1].start.line).toBe(2); // #     "🚀 ~ data:",
      expect(result[0].lines[2].start.line).toBe(3); // #     data
      expect(result[0].lines[3].start.line).toBe(4); // # )
    });

    it('should NOT detect a line that mentions a log function inside a regular # comment', async () => {
      const document = makeTextDocument([
        '# This is a comment explaining that print is used below',
        '# We also call logging.debug for diagnostics',
        'x = compute()',
      ]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });
  });

  describe('Multiple log messages', () => {
    it('should detect multiple logs in the same file', async () => {
      const document = makeTextDocument([
        'x = 5',
        'print("🚀 ~ x:", x)',
        'y = 10',
        'print("🚀 ~ y:", y)',
        'z = x + y',
        'print("🚀 ~ z:", z)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(mockSpacesBeforeLogMsg).toHaveBeenCalledTimes(3);
      expect(result[0].lines[0].start.line).toBe(1);
      expect(result[1].lines[0].start.line).toBe(3);
      expect(result[2].lines[0].start.line).toBe(5);
    });

    it('should detect all logs regardless of Turbo status', async () => {
      const document = makeTextDocument([
        'print("🚀 ~ valid:", x)',
        'print("missing prefix ~ y:", y)',
        'print("🚀 no delimiter", z)',
        'print("🚀 ~ valid too:", a)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(4);
      expect(result[0].isTurboConsoleLog).toBe(true);
      expect(result[1].isTurboConsoleLog).toBe(false);
      expect(result[2].isTurboConsoleLog).toBe(false);
      expect(result[3].isTurboConsoleLog).toBe(true);
    });

    it('should return results sorted by line number', async () => {
      const document = makeTextDocument([
        'print("🚀 ~ first:", a)',
        'x = compute()',
        'logging.debug("🚀 ~ second:", x)',
        'y = transform(x)',
        'logging.warning("🚀 ~ third:", y)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(3);
      expect(result[0].lines[0].start.line).toBeLessThan(
        result[1].lines[0].start.line,
      );
      expect(result[1].lines[0].start.line).toBeLessThan(
        result[2].lines[0].start.line,
      );
    });
  });

  describe('logFunction property tracking', () => {
    it('should set logFunction to "print" for print calls', async () => {
      const document = makeTextDocument(['print("🚀 ~ x:", x)']);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'print',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('print');
    });

    it('should set logFunction for commented Python logs', async () => {
      const document = makeTextDocument([
        '# print("🚀 ~ x:", x)',
        '# logging.debug("🚀 ~ y:", y)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].logFunction).toBe('print');
      expect(result[0].isCommented).toBe(true);
      expect(result[1].logFunction).toBe('logging.debug');
      expect(result[1].isCommented).toBe(true);
    });

    it('should set logFunction even for non-Turbo logs', async () => {
      const document = makeTextDocument([
        'print("regular log without markers")',
        'logging.debug(variable)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].logFunction).toBe('print');
      expect(result[0].isTurboConsoleLog).toBe(false);
      expect(result[1].logFunction).toBe('logging.debug');
      expect(result[1].isTurboConsoleLog).toBe(false);
    });

    it('should set logFunction for multi-line logs', async () => {
      const document = makeTextDocument([
        'logging.error(',
        '    "🚀 ~ err:",',
        '    err',
        ')',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.error',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('logging.error');
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].isTurboConsoleLog).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty document', async () => {
      const document = makeTextDocument([]);

      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
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
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
    });

    it('should detect log at the very first line', async () => {
      const document = makeTextDocument([
        'print("🚀 ~ start:", value)',
        'x = compute()',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(0);
    });

    it('should detect log at the very last line', async () => {
      const document = makeTextDocument([
        'x = compute()',
        'print("🚀 ~ end:", x)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines[0].start.line).toBe(1);
    });

    it('should handle a multi-line log at the end of the document', async () => {
      const document = makeTextDocument([
        'data = {"x": 1}',
        'print(',
        '    "🚀 ~ data:",',
        '    data',
        ')',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(4);
      expect(result[0].lines[0].start.line).toBe(1); // print(
      expect(result[0].lines[1].start.line).toBe(2); // "🚀 ~ data:",
      expect(result[0].lines[2].start.line).toBe(3); // data
      expect(result[0].lines[3].start.line).toBe(4); // )
    });
  });

  describe('Complex scenarios', () => {
    it('should detect logs indented inside a Python function', async () => {
      const document = makeTextDocument([
        'def process(x, y):',
        '    result = x + y',
        '    print("🚀 ~ result:", result)',
        '    return result',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines[0].start.line).toBe(2);
    });

    it('should detect logs indented inside a Python class method', async () => {
      const document = makeTextDocument([
        'class Processor:',
        '    def run(self):',
        '        data = self.load()',
        '        logging.debug("🚀 ~ data:", data)',
        '        return data',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('        ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        'logging.debug',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].spaces).toBe('        ');
      expect(result[0].lines[0].start.line).toBe(3);
    });

    it('should detect logs at multiple indentation levels', async () => {
      const document = makeTextDocument([
        'def outer():',
        '    x = 1',
        '    print("🚀 ~ x:", x)',
        '    def inner():',
        '        y = 2',
        '        print("🚀 ~ y:", y)',
      ]);

      mockSpacesBeforeLogMsg
        .mockReturnValueOnce('    ')
        .mockReturnValueOnce('        ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(2);
      expect(result[0].spaces).toBe('    ');
      expect(result[0].lines[0].start.line).toBe(2);
      expect(result[1].spaces).toBe('        ');
      expect(result[1].lines[0].start.line).toBe(5);
    });

    it('should correctly differentiate Turbo and non-Turbo logs in a mixed Python file', async () => {
      const document = makeTextDocument([
        'import logging',
        '',
        'def process(data):',
        '    print("🚀 ~ data:", data)',
        '    logging.debug("🚀 ~ debug:", data)',
        '    print("manual log without markers")',
        '    logging.info("info without prefix", data)',
        '    print("🚀 ~ result:", result)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('    ');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(5);

      const turboLogs = result.filter((m) => m.isTurboConsoleLog);
      const nonTurboLogs = result.filter((m) => !m.isTurboConsoleLog);

      expect(turboLogs).toHaveLength(3);
      expect(nonTurboLogs).toHaveLength(2);

      expect(turboLogs[0].lines[0].start.line).toBe(3);
      expect(turboLogs[1].lines[0].start.line).toBe(4);
      expect(turboLogs[2].lines[0].start.line).toBe(7);
    });

    it('should handle special regex characters in the log function name', async () => {
      const document = makeTextDocument([
        '$logger.info("🚀 ~ value:", value)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        '$logger.info',
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toHaveLength(1);
      expect(result[0].logFunction).toBe('$logger.info');
    });

    it('should handle special regex characters in prefix and delimiter', async () => {
      const document = makeTextDocument([
        'print("[DEBUG] | value:", value)',
      ]);

      mockSpacesBeforeLogMsg.mockReturnValue('');
      mockFsReadFileSync.mockReturnValue(document.getText());

      const result = await detectAll(
        fs,
        vscode,
        '/test/file.py',
        defaultExtensionProperties.logFunction,
        '[DEBUG]',
        '|',
      );

      expect(result).toHaveLength(1);
      expect(result[0].isTurboConsoleLog).toBe(true);
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

    it('should return empty array and log error when fs.readFileSync throws', async () => {
      const readError = new Error('ENOENT: no such file or directory');
      mockFsReadFileSync.mockImplementation(() => {
        throw readError;
      });

      const result = await detectAll(
        fs,
        vscode,
        '/non/existent/file.py',
        defaultExtensionProperties.logFunction,
        defaultExtensionProperties.logMessagePrefix,
        defaultExtensionProperties.delimiterInsideMessage,
      );

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to detect Python logs in file "/non/existent/file.py":',
        'ENOENT: no such file or directory',
      );
    });
  });
});
