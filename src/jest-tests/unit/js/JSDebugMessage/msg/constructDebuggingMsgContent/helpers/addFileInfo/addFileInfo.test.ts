import { addFileInfo } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addFileInfo';
import { resolveDelimiterSpacing } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing';

// Mock the resolveDelimiterSpacing dependency
jest.mock('@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing');

describe('addFileInfo', () => {
  // Mock function
  const mockResolveDelimiterSpacing = resolveDelimiterSpacing as jest.MockedFunction<typeof resolveDelimiterSpacing>;

  // Test data
  const fileName = 'testFile.js';
  const lineNum = 42;
  const delimiter = ' | ';

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock return value
    mockResolveDelimiterSpacing.mockReturnValue(' | ');
  });

  describe('when both filename and line number are included', () => {
    it('should return array with filename:lineNum and delimiter', () => {
      const result = addFileInfo(fileName, lineNum, true, true, delimiter);

      expect(result).toEqual(['testFile.js:42', ' | ']);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', delimiter);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledTimes(1);
    });

    it('should call resolveDelimiterSpacing with empty prefix and provided delimiter', () => {
      addFileInfo(fileName, lineNum, true, true, delimiter);

      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', delimiter);
    });
  });

  describe('when only filename is included', () => {
    it('should return array with filename only and delimiter', () => {
      const result = addFileInfo(fileName, lineNum, true, false, delimiter);

      expect(result).toEqual(['testFile.js', ' | ']);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', delimiter);
    });

    it('should not include colon when line number is excluded', () => {
      const result = addFileInfo('app.ts', 123, true, false, ' - ');

      expect(result[0]).toBe('app.ts');
      expect(result[0]).not.toContain(':');
    });
  });

  describe('when only line number is included', () => {
    it('should return array with :lineNum and delimiter', () => {
      const result = addFileInfo(fileName, lineNum, false, true, delimiter);

      expect(result).toEqual([':42', ' | ']);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', delimiter);
    });

    it('should include colon prefix when only line number is shown', () => {
      const result = addFileInfo('ignored.js', 99, false, true, ' >> ');

      expect(result[0]).toBe(':99');
      expect(result[0].startsWith(':')).toBe(true);
    });
  });

  describe('when neither filename nor line number is included', () => {
    it('should return empty array', () => {
      const result = addFileInfo(fileName, lineNum, false, false, delimiter);

      expect(result).toEqual([]);
      expect(mockResolveDelimiterSpacing).not.toHaveBeenCalled();
    });

    it('should not call resolveDelimiterSpacing when nothing is included', () => {
      addFileInfo('any.js', 1, false, false, 'any delimiter');

      expect(mockResolveDelimiterSpacing).toHaveBeenCalledTimes(0);
    });
  });

  describe('delimiter handling', () => {
    it('should use the resolved delimiter from resolveDelimiterSpacing', () => {
      const customDelimiterResult = ' :: ';
      mockResolveDelimiterSpacing.mockReturnValue(customDelimiterResult);

      const result = addFileInfo(fileName, lineNum, true, true, ' -> ');

      expect(result[1]).toBe(customDelimiterResult);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', ' -> ');
    });

    it('should handle empty delimiter', () => {
      mockResolveDelimiterSpacing.mockReturnValue('');

      const result = addFileInfo(fileName, lineNum, true, false, '');

      expect(result).toEqual(['testFile.js', '']);
      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', '');
    });

    it('should handle complex delimiters', () => {
      const complexDelimiter = ' [DEBUG] ';
      mockResolveDelimiterSpacing.mockReturnValue(complexDelimiter);

      const result = addFileInfo('complex.ts', 777, false, true, complexDelimiter);

      expect(result).toEqual([':777', complexDelimiter]);
    });
  });

  describe('edge cases', () => {
    it('should handle zero line number', () => {
      const result = addFileInfo(fileName, 0, false, true, delimiter);

      expect(result).toEqual([':0', ' | ']);
    });

    it('should handle empty filename', () => {
      const result = addFileInfo('', lineNum, true, false, delimiter);

      expect(result).toEqual(['', ' | ']);
    });

    it('should handle empty filename with line number', () => {
      const result = addFileInfo('', lineNum, true, true, delimiter);

      expect(result).toEqual([':42', ' | ']);
    });

    it('should handle very long filename', () => {
      const longFileName = 'very-very-very-long-filename-that-exceeds-normal-length.js';
      const result = addFileInfo(longFileName, lineNum, true, true, delimiter);

      expect(result[0]).toBe(`${longFileName}:42`);
    });

    it('should handle filename with special characters', () => {
      const specialFileName = 'file-with@special#chars$.ts';
      const result = addFileInfo(specialFileName, lineNum, true, false, delimiter);

      expect(result[0]).toBe(specialFileName);
    });
  });

  describe('return value structure', () => {
    it('should always return an array', () => {
      const result1 = addFileInfo(fileName, lineNum, true, true, delimiter);
      const result2 = addFileInfo(fileName, lineNum, false, false, delimiter);

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });

    it('should return exactly 2 elements when file info is included', () => {
      const result1 = addFileInfo(fileName, lineNum, true, true, delimiter);
      const result2 = addFileInfo(fileName, lineNum, true, false, delimiter);
      const result3 = addFileInfo(fileName, lineNum, false, true, delimiter);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result3).toHaveLength(2);
    });

    it('should return 0 elements when no file info is included', () => {
      const result = addFileInfo(fileName, lineNum, false, false, delimiter);

      expect(result).toHaveLength(0);
    });
  });

  describe('integration with resolveDelimiterSpacing', () => {
    it('should pass empty prefix to resolveDelimiterSpacing', () => {
      addFileInfo(fileName, lineNum, true, true, ' test ');

      expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('', ' test ');
    });

    it('should use resolveDelimiterSpacing result as second array element', () => {
      const expectedDelimiter = ' PROCESSED ';
      mockResolveDelimiterSpacing.mockReturnValue(expectedDelimiter);

      const result = addFileInfo(fileName, lineNum, true, true, 'input');

      expect(result[1]).toBe(expectedDelimiter);
    });
  });
});
