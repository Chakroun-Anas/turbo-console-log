import { selectQuote } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/selectQuote';

describe('selectQuote', () => {
  describe('object literal detection', () => {
    it('should return backticks when content starts with opening brace', () => {
      const result = selectQuote('"', '{ name: "test" }');
      expect(result).toBe('`');
    });

    it('should return backticks when trimmed content starts with opening brace', () => {
      const result = selectQuote('"', '  { name: "test" }  ');
      expect(result).toBe('`');
    });

    it('should not treat brace in middle as object literal', () => {
      const result = selectQuote('"', 'text { not object }');
      expect(result).toBe('"');
    });
  });

  describe('quote conflict resolution', () => {
    it('should return backticks when content contains double quotes', () => {
      const result = selectQuote('"', 'text with "quotes" inside');
      expect(result).toBe('`');
    });

    it('should return double quotes when content contains single quotes', () => {
      const result = selectQuote("'", "text with 'quotes' inside");
      expect(result).toBe('"');
    });

    it('should prioritize backticks over double quotes when content has both quote types', () => {
      const result = selectQuote('"', `text with "double" and 'single' quotes`);
      expect(result).toBe('`');
    });
  });

  describe('default quote behavior', () => {
    it('should return default quote when no conflicts exist', () => {
      const result = selectQuote('"', 'simple text without quotes');
      expect(result).toBe('"');
    });

    it('should return single quote default when no conflicts exist', () => {
      const result = selectQuote("'", 'simple text without quotes');
      expect(result).toBe("'");
    });

    it('should return backtick default when no conflicts exist', () => {
      const result = selectQuote('`', 'simple text without quotes');
      expect(result).toBe('`');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string content', () => {
      const result = selectQuote('"', '');
      expect(result).toBe('"');
    });

    it('should handle whitespace-only content', () => {
      const result = selectQuote('"', '   ');
      expect(result).toBe('"');
    });

    it('should handle content with only opening brace', () => {
      const result = selectQuote('"', '{');
      expect(result).toBe('`');
    });

    it('should handle content with brace and quotes', () => {
      const result = selectQuote('"', '{ "key": "value" }');
      expect(result).toBe('`');
    });
  });
});
