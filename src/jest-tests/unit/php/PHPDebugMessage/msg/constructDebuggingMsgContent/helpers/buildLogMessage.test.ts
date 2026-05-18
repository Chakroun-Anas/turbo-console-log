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
      const result = buildLogMessage(parts, 'var_dump', '"', '$user', true);
      expect(result).toBe(
        'var_dump("🚀 : UserService : create : $user:", $user);',
      );
    });

    it('should build var_dump without semicolon when disabled', () => {
      const parts = ['DEBUG', ' : ', '$value', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$value', false);
      expect(result).toBe('var_dump("DEBUG : $value:", $value)');
    });

    it('should use single quotes when appropriate', () => {
      const parts = ['Test', ' : ', '$data', ':'];
      const result = buildLogMessage(parts, 'var_dump', "'", '$data', true);
      expect(result).toBe("var_dump('Test : $data:', $data);");
    });

    it('should handle empty parts array', () => {
      const parts: string[] = [];
      const result = buildLogMessage(parts, 'var_dump', '"', '$x', true);
      expect(result).toBe('var_dump("", $x);');
    });
  });

  describe('print_r function', () => {
    it('should build print_r with associative array format', () => {
      const parts = ['🚀', ' : ', '$user', ':'];
      const result = buildLogMessage(parts, 'print_r', '"', '$user', true);
      expect(result).toBe('print_r(["🚀 : $user:" => $user]);');
    });

    it('should build print_r without semicolon when disabled', () => {
      const parts = ['LOG', ' : ', '$data', ':'];
      const result = buildLogMessage(parts, 'print_r', '"', '$data', false);
      expect(result).toBe('print_r(["LOG : $data:" => $data])');
    });

    it('should use single quotes for print_r', () => {
      const parts = ['Info', ' : ', '$item', ':'];
      const result = buildLogMessage(parts, 'print_r', "'", '$item', true);
      expect(result).toBe("print_r(['Info : $item:' => $item]);");
    });
  });

  describe('error_log function', () => {
    it('should build error_log with concatenation and print_r', () => {
      const parts = ['🔥', ' : ', '$error', ':'];
      const result = buildLogMessage(parts, 'error_log', '"', '$error', true);
      expect(result).toBe('error_log("🔥 : $error:" . print_r($error, true));');
    });

    it('should build error_log without semicolon when disabled', () => {
      const parts = ['ERROR', ' : ', '$exception', ':'];
      const result = buildLogMessage(
        parts,
        'error_log',
        '"',
        '$exception',
        false,
      );
      expect(result).toBe(
        'error_log("ERROR : $exception:" . print_r($exception, true))',
      );
    });

    it('should use single quotes for error_log', () => {
      const parts = ['Warning', ' : ', '$msg', ':'];
      const result = buildLogMessage(parts, 'error_log', "'", '$msg', true);
      expect(result).toBe(
        "error_log('Warning : $msg:' . print_r($msg, true));",
      );
    });
  });

  describe('default/unknown function (uses getLogFunction which returns as-is)', () => {
    it('should use unknown function name as-is (not fallback)', () => {
      const parts = ['TEST', ' : ', '$val', ':'];
      const result = buildLogMessage(
        parts,
        'unknown_function',
        '"',
        '$val',
        true,
      );
      // getLogFunction returns the function name as-is for unknown functions
      expect(result).toBe(
        'unknown_function("TEST : $val:" . print_r($val, true));',
      );
    });

    it('should handle custom function by using it as-is', () => {
      const parts = ['Custom', ' : ', '$x', ':'];
      const result = buildLogMessage(parts, 'my_custom_log', '"', '$x', false);
      // Custom functions are used as-is, not forced to error_log
      expect(result).toBe('my_custom_log("Custom : $x:" . print_r($x, true))');
    });
  });

  describe('quote selection behavior', () => {
    it('should select single quote when variable contains double quotes', () => {
      const parts = ['Log', ' : ', '$msg', ':'];
      const result = buildLogMessage(
        parts,
        'var_dump',
        '"',
        '$msg = "test"',
        true,
      );
      // selectQuote will detect double quotes and return single quote
      expect(result).toBe('var_dump(\'Log : $msg:\', $msg = "test");');
    });

    it('should select double quote when variable contains single quotes', () => {
      const parts = ['Log', ' : ', '$msg', ':'];
      const result = buildLogMessage(
        parts,
        'var_dump',
        "'",
        "$msg = 'test'",
        true,
      );
      // selectQuote will detect single quotes and return double quote
      expect(result).toBe('var_dump("Log : $msg:", $msg = \'test\');');
    });
  });

  describe('complex variable expressions', () => {
    it('should handle array access in var_dump', () => {
      const parts = ['Array', ' : ', '$data[0]', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$data[0]', true);
      expect(result).toBe('var_dump("Array : $data[0]:", $data[0]);');
    });

    it('should handle object property in print_r', () => {
      const parts = ['Object', ' : ', '$user->name', ':'];
      const result = buildLogMessage(
        parts,
        'print_r',
        '"',
        '$user->name',
        true,
      );
      expect(result).toBe('print_r(["Object : $user->name:" => $user->name]);');
    });

    it('should handle method calls in error_log', () => {
      const parts = ['Method', ' : ', '$obj->getValue()', ':'];
      const result = buildLogMessage(
        parts,
        'error_log',
        '"',
        '$obj->getValue()',
        true,
      );
      expect(result).toBe(
        'error_log("Method : $obj->getValue():" . print_r($obj->getValue(), true));',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long message parts', () => {
      const longParts = Array(50).fill('part').concat([' : ', '$var', ':']);
      const result = buildLogMessage(longParts, 'var_dump', '"', '$var', true);
      expect(result).toContain('var_dump(');
      expect(result).toContain('$var);');
    });

    it('should handle special characters in parts', () => {
      const parts = ['🚀🔥💻', ' >> ', '$special', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$special', true);
      expect(result).toBe('var_dump("🚀🔥💻 >> $special:", $special);');
    });

    it('should handle newline characters in parts', () => {
      const parts = ['Line1\nLine2', ' : ', '$x', ':'];
      const result = buildLogMessage(parts, 'var_dump', '"', '$x', true);
      expect(result).toContain('Line1\nLine2');
    });
  });
});
