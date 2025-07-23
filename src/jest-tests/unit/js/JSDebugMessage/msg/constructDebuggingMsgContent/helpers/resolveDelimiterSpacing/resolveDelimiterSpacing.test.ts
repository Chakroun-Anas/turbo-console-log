import { resolveDelimiterSpacing } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing';

describe('resolveDelimiterSpacing', () => {
  describe('when addSpace is true (default)', () => {
    it('should return formatted delimiter with spaces for normal case', () => {
      const result = resolveDelimiterSpacing(':', true);
      expect(result).toBe(' : ');
    });

    it('should return formatted delimiter with spaces for complex delimiter', () => {
      const result = resolveDelimiterSpacing('->', true);
      expect(result).toBe(' -> ');
    });
  });

  describe('when addSpace is false', () => {
    it('should return plain delimiter without spaces for normal case', () => {
      const result = resolveDelimiterSpacing(':', false);
      expect(result).toBe(':');
    });

    it('should return plain delimiter without spaces for complex delimiter', () => {
      const result = resolveDelimiterSpacing('->', false);
      expect(result).toBe('->');
    });
  });

  describe('default parameter behavior', () => {
    it('should default addSpace to true when not provided', () => {
      const result = resolveDelimiterSpacing(':');
      expect(result).toBe(' : ');
    });
  });

  describe('edge cases', () => {
    it('should handle single character delimiters', () => {
      expect(resolveDelimiterSpacing('b', true)).toBe(' b ');
      expect(resolveDelimiterSpacing('b', false)).toBe('b');
    });

    it('should handle multi-character delimiters', () => {
      expect(resolveDelimiterSpacing('===', true)).toBe(' === ');
      expect(resolveDelimiterSpacing('===', false)).toBe('===');
    });

    it('should handle special characters in delimiter', () => {
      expect(resolveDelimiterSpacing('|', true)).toBe(' | ');
      expect(resolveDelimiterSpacing('&', false)).toBe('&');
    });
  });
});
