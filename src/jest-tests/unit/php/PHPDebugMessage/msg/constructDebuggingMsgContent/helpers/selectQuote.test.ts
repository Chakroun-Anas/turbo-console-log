import { selectQuote } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/selectQuote';

describe('PHP selectQuote', () => {
  it('should return default quote when content has no quotes', () => {
    const result = selectQuote('"', '$user');
    expect(result).toBe('"');
  });

  it('should return single quote when content contains double quotes', () => {
    const result = selectQuote('"', '$msg = "hello"');
    expect(result).toBe("'");
  });

  it('should return double quote when content contains single quotes', () => {
    const result = selectQuote("'", "$msg = 'hello'");
    expect(result).toBe('"');
  });

  it('should prefer avoiding double quotes in PHP (for interpolation safety)', () => {
    const result = selectQuote('"', 'text with "quotes"');
    expect(result).toBe("'");
  });

  it('should return default when no conflicts', () => {
    const result = selectQuote("'", '$simple');
    expect(result).toBe("'");
  });

  it('should handle empty content', () => {
    const result = selectQuote('"', '');
    expect(result).toBe('"');
  });

  it('should handle content with both quote types (prefer single)', () => {
    const result = selectQuote('"', 'mix "double" and \'single\'');
    // When both are present, function finds double quotes first, returns single
    expect(result).toBe("'");
  });

  it('should respect default quote setting', () => {
    const result = selectQuote('`', '$var');
    expect(result).toBe('`');
  });
});
