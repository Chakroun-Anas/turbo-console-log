import { buildLogMessage } from '@/debug-message/python/PythonDebugMessage/msg/constructDebuggingMsgContent/helpers/buildLogMessage/buildLogMessage';

describe('Python buildLogMessage', () => {
  describe('print function', () => {
    it('should build a print statement with parts and variable', () => {
      const parts = ['🚀 ~ ', 'super_len', ' ~ ', 'total_length', ':'];
      const result = buildLogMessage(parts, 'print', '"', 'total_length');
      expect(result).toBe(
        'print("🚀 ~ super_len ~ total_length:", total_length)',
      );
    });

    it('should handle an empty parts array', () => {
      const result = buildLogMessage([], 'print', '"', 'x');
      expect(result).toBe('print("", x)');
    });
  });

  describe('logging.* functions', () => {
    it('should build a logging.debug statement with a %s placeholder', () => {
      const parts = ['🚀 ~ ', 'value', ':'];
      const result = buildLogMessage(parts, 'logging.debug', '"', 'value');
      expect(result).toBe('logging.debug("🚀 ~ value: %s", value)');
    });

    it('should build a logging.error statement with a %s placeholder', () => {
      const parts = ['ERROR ~ ', 'err', ':'];
      const result = buildLogMessage(parts, 'logging.error', '"', 'err');
      expect(result).toBe('logging.error("ERROR ~ err: %s", err)');
    });
  });

  describe('quote selection behavior', () => {
    it('should switch to single quotes when the variable contains a double quote', () => {
      const parts = ['Log ~ ', 'msg', ':'];
      const result = buildLogMessage(parts, 'print', '"', 'msg == "x"');
      expect(result).toBe("print('Log ~ msg:', msg == \"x\")");
    });

    it('should switch to double quotes when the variable contains a single quote', () => {
      const parts = ['Log ~ ', 'msg', ':'];
      const result = buildLogMessage(parts, 'print', "'", "msg == 'x'");
      expect(result).toBe('print("Log ~ msg:", msg == \'x\')');
    });
  });

  describe('Python never terminates statements with a semicolon (flake8 E703)', () => {
    // Unlike JS/TS (optional) and PHP (required), Python must never emit a
    // trailing semicolon — the global addSemicolonInTheEnd setting is ignored.
    it.each([
      ['print', ['🚀 ~ ', 'a', ':'], 'a'],
      ['logging.debug', ['🚀 ~ ', 'b', ':'], 'b'],
      ['logging.info', ['🚀 ~ ', 'c', ':'], 'c'],
      ['logging.warning', ['🚀 ~ ', 'd', ':'], 'd'],
      ['logging.error', ['🚀 ~ ', 'e', ':'], 'e'],
    ])('does not append a semicolon for %s', (fn, parts, variable) => {
      const result = buildLogMessage(parts as string[], fn, '"', variable);
      expect(result.endsWith(';')).toBe(false);
    });
  });
});
