import { getTabSize } from '@/utilities/getTabSize';

describe('getTabSize', () => {
  describe('number input', () => {
    it('should return the number as-is when given a valid number', () => {
      expect(getTabSize(2)).toBe(2);
      expect(getTabSize(4)).toBe(4);
      expect(getTabSize(8)).toBe(8);
    });
  });

  describe('string input', () => {
    it('should parse valid numeric strings', () => {
      expect(getTabSize('2')).toBe(2);
      expect(getTabSize('4')).toBe(4);
      expect(getTabSize('8')).toBe(8);
    });

    it('should handle string zero', () => {
      expect(getTabSize('0')).toBe(0);
    });

    it('should handle strings with leading/trailing whitespace', () => {
      expect(getTabSize(' 4 ')).toBe(4);
      expect(getTabSize('\t2\t')).toBe(2);
    });

    it('should return default for empty string', () => {
      expect(getTabSize('')).toBe(4); // Empty string is falsy, returns default
    });
  });

  describe('undefined input', () => {
    it('should return default tab size of 4 for undefined', () => {
      expect(getTabSize(undefined)).toBe(4);
    });
  });
});
