import { buildLogMessage } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/buildLogMessage';

describe('PHP buildLogMessage', () => {
  describe('var_dump function', () => {
    it('should build var_dump statement with parts and variable', () => {
      const parts = [
        '🚀',
        ' : ',
        'UserService',
        ' : ',
        'create',
        ' : ',
        '$user',
        ':',
      ];
      const result = buildLogMessage(parts, 'var_dump', '"', '$user');
      expect(result).toBe(
        'var_dump("🚀 : UserService : create : $user:", $user);',
      );
    });

    it('should always terminate var_dump with a semicolon', () => {
      const parts = ['DEBUG', ' : ', '$value', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$value');
      expect(result).toBe('var_dump("DEBUG : $value:", $value);');
    });

    it('should use single quotes when appropriate', () => {
      const parts = ['Test', ' : ', '$data', ':'];
      const result = buildLogMessage(parts, 'var_dump', "'", '$data');
      expect(result).toBe("var_dump('Test : $data:', $data);");
    });

    it('should handle empty parts array', () => {
      const parts: string[] = [];
      const result = buildLogMessage(parts, 'var_dump', '"', '$x');
      expect(result).toBe('var_dump("", $x);');
    });
  });

  describe('print_r function', () => {
    it('should build print_r with associative array format', () => {
      const parts = ['🚀', ' : ', '$user', ':'];
      const result = buildLogMessage(parts, 'print_r', '"', '$user');
      expect(result).toBe('print_r(["🚀 : $user:" => $user]);');
    });

    it('should always terminate print_r with a semicolon', () => {
      const parts = ['LOG', ' : ', '$data', ':'];
      const result = buildLogMessage(parts, 'print_r', '"', '$data');
      expect(result).toBe('print_r(["LOG : $data:" => $data]);');
    });

    it('should use single quotes for print_r', () => {
      const parts = ['Info', ' : ', '$item', ':'];
      const result = buildLogMessage(parts, 'print_r', "'", '$item');
      expect(result).toBe("print_r(['Info : $item:' => $item]);");
    });
  });

  describe('error_log function', () => {
    it('should build error_log with concatenation and print_r', () => {
      const parts = ['🔥', ' : ', '$error', ':'];
      const result = buildLogMessage(parts, 'error_log', '"', '$error');
      expect(result).toBe('error_log("🔥 : $error:" . print_r($error, true));');
    });

    it('should always terminate error_log with a semicolon', () => {
      const parts = ['ERROR', ' : ', '$exception', ':'];
      const result = buildLogMessage(parts, 'error_log', '"', '$exception');
      expect(result).toBe(
        'error_log("ERROR : $exception:" . print_r($exception, true));',
      );
    });

    it('should use single quotes for error_log', () => {
      const parts = ['Warning', ' : ', '$msg', ':'];
      const result = buildLogMessage(parts, 'error_log', "'", '$msg');
      expect(result).toBe(
        "error_log('Warning : $msg:' . print_r($msg, true));",
      );
    });
  });

  describe('default/unknown function (uses getLogFunction which returns as-is)', () => {
    it('should use unknown function name as-is (not fallback)', () => {
      const parts = ['TEST', ' : ', '$val', ':'];
      const result = buildLogMessage(parts, 'unknown_function', '"', '$val');
      // getLogFunction returns the function name as-is for unknown functions
      expect(result).toBe(
        'unknown_function("TEST : $val:" . print_r($val, true));',
      );
    });

    it('should handle custom function by using it as-is', () => {
      const parts = ['Custom', ' : ', '$x', ':'];
      const result = buildLogMessage(parts, 'my_custom_log', '"', '$x');
      // Custom functions are used as-is, not forced to error_log
      expect(result).toBe('my_custom_log("Custom : $x:" . print_r($x, true));');
    });
  });

  describe('quote selection behavior', () => {
    it('should select single quote when variable contains double quotes', () => {
      const parts = ['Log', ' : ', '$msg', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$msg = "test"');
      // selectQuote will detect double quotes and return single quote
      expect(result).toBe('var_dump(\'Log : $msg:\', $msg = "test");');
    });

    it('should select double quote when variable contains single quotes', () => {
      const parts = ['Log', ' : ', '$msg', ':'];
      const result = buildLogMessage(parts, 'var_dump', "'", "$msg = 'test'");
      // selectQuote will detect single quotes and return double quote
      expect(result).toBe('var_dump("Log : $msg:", $msg = \'test\');');
    });
  });

  describe('complex variable expressions', () => {
    it('should handle array access in var_dump', () => {
      const parts = ['Array', ' : ', '$data[0]', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$data[0]');
      expect(result).toBe('var_dump("Array : $data[0]:", $data[0]);');
    });

    it('should handle object property in print_r', () => {
      const parts = ['Object', ' : ', '$user->name', ':'];
      const result = buildLogMessage(parts, 'print_r', '"', '$user->name');
      expect(result).toBe('print_r(["Object : $user->name:" => $user->name]);');
    });

    it('should handle method calls in error_log', () => {
      const parts = ['Method', ' : ', '$obj->getValue()', ':'];
      const result = buildLogMessage(
        parts,
        'error_log',
        '"',
        '$obj->getValue()',
      );
      expect(result).toBe(
        'error_log("Method : $obj->getValue():" . print_r($obj->getValue(), true));',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long message parts', () => {
      const longParts = Array(50).fill('part').concat([' : ', '$var', ':']);
      const result = buildLogMessage(longParts, 'var_dump', '"', '$var');
      expect(result).toContain('var_dump(');
      expect(result).toContain('$var);');
    });

    it('should handle special characters in parts', () => {
      const parts = ['🚀🔥💻', ' >> ', '$special', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$special');
      expect(result).toBe('var_dump("🚀🔥💻 >> $special:", $special);');
    });

    it('should handle newline characters in parts', () => {
      const parts = ['Line1\nLine2', ' : ', '$x', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$x');
      expect(result).toContain('Line1\nLine2');
    });
  });

  describe('PHP always terminates statements with a semicolon (required syntax)', () => {
    // Unlike JS/TS (optional, driven by addSemicolonInTheEnd), PHP statements
    // are a syntax error without a trailing semicolon, so one is always emitted.
    it.each([
      ['var_dump', ['🚀 : ', '$a', ':'], '$a'],
      ['print_r', ['🚀 : ', '$b', ':'], '$b'],
      ['error_log', ['🚀 : ', '$c', ':'], '$c'],
      ['unknown_function', ['🚀 : ', '$d', ':'], '$d'],
    ])('always ends %s output with a semicolon', (fn, parts, variable) => {
      const result = buildLogMessage(parts as string[], fn, '"', variable);
      expect(result.endsWith(';')).toBe(true);
    });
  });
});
