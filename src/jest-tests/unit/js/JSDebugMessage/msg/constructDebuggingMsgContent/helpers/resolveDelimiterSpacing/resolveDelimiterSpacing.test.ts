import { resolveDelimiterSpacing } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing';

describe('resolveDelimiterSpacing', () => {
  describe('when addSpace is true (default)', () => {
    it('should return space when prefix is empty string', () => {
      const result = resolveDelimiterSpacing('', ':', true);
      expect(result).toBe(' ');
    });

    it('should return space when delimiter is empty string', () => {
      const result = resolveDelimiterSpacing('prefix', '', true);
      expect(result).toBe(' ');
    });

    it('should return space when both prefix and delimiter are empty', () => {
      const result = resolveDelimiterSpacing('', '', true);
      expect(result).toBe(' ');
    });

    it('should return space when prefix equals delimiter with trailing space', () => {
      const result = resolveDelimiterSpacing(': ', ':', true);
      expect(result).toBe(' ');
    });

    it('should return formatted delimiter with spaces for normal case', () => {
      const result = resolveDelimiterSpacing('prefix', ':', true);
      expect(result).toBe(' : ');
    });

    it('should return formatted delimiter with spaces for complex delimiter', () => {
      const result = resolveDelimiterSpacing('prefix', '->', true);
      expect(result).toBe(' -> ');
    });

    it('should return formatted delimiter with spaces when prefix does not match pattern', () => {
      const result = resolveDelimiterSpacing('other', ':', true);
      expect(result).toBe(' : ');
    });
  });

  describe('when addSpace is false', () => {
    it('should return empty string when prefix is empty string', () => {
      const result = resolveDelimiterSpacing('', ':', false);
      expect(result).toBe('');
    });

    it('should return empty string when delimiter is empty string', () => {
      const result = resolveDelimiterSpacing('prefix', '', false);
      expect(result).toBe('');
    });

    it('should return empty string when both prefix and delimiter are empty', () => {
      const result = resolveDelimiterSpacing('', '', false);
      expect(result).toBe('');
    });

    it('should return empty string when prefix equals delimiter with trailing space', () => {
      const result = resolveDelimiterSpacing(': ', ':', false);
      expect(result).toBe('');
    });

    it('should return plain delimiter without spaces for normal case', () => {
      const result = resolveDelimiterSpacing('prefix', ':', false);
      expect(result).toBe(':');
    });

    it('should return plain delimiter without spaces for complex delimiter', () => {
      const result = resolveDelimiterSpacing('prefix', '->', false);
      expect(result).toBe('->');
    });

    it('should return plain delimiter without spaces when prefix does not match pattern', () => {
      const result = resolveDelimiterSpacing('other', ':', false);
      expect(result).toBe(':');
    });
  });

  describe('default parameter behavior', () => {
    it('should default addSpace to true when not provided', () => {
      const result = resolveDelimiterSpacing('prefix', ':');
      expect(result).toBe(' : ');
    });

    it('should handle empty strings with default addSpace', () => {
      const result = resolveDelimiterSpacing('', ':');
      expect(result).toBe(' ');
    });

    it('should handle prefix match with default addSpace', () => {
      const result = resolveDelimiterSpacing(': ', ':');
      expect(result).toBe(' ');
    });
  });

  describe('edge cases', () => {
    it('should handle single character delimiters', () => {
      expect(resolveDelimiterSpacing('a', 'b', true)).toBe(' b ');
      expect(resolveDelimiterSpacing('a', 'b', false)).toBe('b');
    });

    it('should handle multi-character delimiters', () => {
      expect(resolveDelimiterSpacing('prefix', '===', true)).toBe(' === ');
      expect(resolveDelimiterSpacing('prefix', '===', false)).toBe('===');
    });

    it('should handle whitespace in prefix', () => {
      expect(resolveDelimiterSpacing(' prefix ', ':', true)).toBe(' : ');
      expect(resolveDelimiterSpacing(' prefix ', ':', false)).toBe(':');
    });

    it('should handle special characters in delimiter', () => {
      expect(resolveDelimiterSpacing('prefix', '|', true)).toBe(' | ');
      expect(resolveDelimiterSpacing('prefix', '&', false)).toBe('&');
    });

    it('should handle exact match case with different spacing', () => {
      // This tests the specific condition: prefix === `${delimiter} `
      expect(resolveDelimiterSpacing('| ', '|', true)).toBe(' ');
      expect(resolveDelimiterSpacing('| ', '|', false)).toBe('');
    });

    it('should not match when prefix has delimiter but no trailing space', () => {
      expect(resolveDelimiterSpacing('|', '|', true)).toBe(' | ');
      expect(resolveDelimiterSpacing('|', '|', false)).toBe('|');
    });

    it('should not match when prefix has delimiter with extra characters', () => {
      expect(resolveDelimiterSpacing('| extra', '|', true)).toBe(' | ');
      expect(resolveDelimiterSpacing('| extra', '|', false)).toBe('|');
    });
  });
});
