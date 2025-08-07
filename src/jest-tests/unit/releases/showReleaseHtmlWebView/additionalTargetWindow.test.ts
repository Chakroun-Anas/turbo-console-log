import { additionalTargetWindow } from '@/releases/showReleaseHtmlWebView/additionalTargetWindow';
import { ExtensionProperties } from '@/entities';

describe('additionalTargetWindow', () => {
  describe('Window progression cycle', () => {
    it('should return Afternoon when current window is Morning', () => {
      const currentWindow: ExtensionProperties['releaseReviewTargetWindow'] =
        'Morning';

      const result = additionalTargetWindow(currentWindow);

      expect(result).toBe('Afternoon');
    });

    it('should return Evening when current window is Afternoon', () => {
      const currentWindow: ExtensionProperties['releaseReviewTargetWindow'] =
        'Afternoon';

      const result = additionalTargetWindow(currentWindow);

      expect(result).toBe('Evening');
    });

    it('should return Night when current window is Evening', () => {
      const currentWindow: ExtensionProperties['releaseReviewTargetWindow'] =
        'Evening';

      const result = additionalTargetWindow(currentWindow);

      expect(result).toBe('Night');
    });

    it('should return Evening when current window is Night (wraps around but skips to previous)', () => {
      const currentWindow: ExtensionProperties['releaseReviewTargetWindow'] =
        'Night';

      const result = additionalTargetWindow(currentWindow);

      expect(result).toBe('Evening');
    });
  });

  describe('Real-world release notification scenarios', () => {
    it('should provide fallback window for morning users who missed their 7 AM - 12 PM window', () => {
      // Morning users (7 AM - 12 PM) should get Afternoon (1 PM - 5 PM) as fallback
      const result = additionalTargetWindow('Morning');

      expect(result).toBe('Afternoon');
    });

    it('should provide fallback window for afternoon users who missed their 1 PM - 5 PM window', () => {
      // Afternoon users (1 PM - 5 PM) should get Evening (5 PM - 9 PM) as fallback
      const result = additionalTargetWindow('Afternoon');

      expect(result).toBe('Evening');
    });

    it('should provide fallback window for evening users who missed their 5 PM - 9 PM window', () => {
      // Evening users (5 PM - 9 PM) should get Night (9 PM - 2 AM) as fallback
      const result = additionalTargetWindow('Evening');

      expect(result).toBe('Night');
    });

    it('should provide fallback window for night users who missed their 9 PM - 2 AM window', () => {
      // Night users (9 PM - 2 AM) should get Evening (5 PM - 9 PM) as fallback
      // This makes sense as Evening comes before Night in the next day cycle
      const result = additionalTargetWindow('Night');

      expect(result).toBe('Evening');
    });
  });

  describe('Window cycling logic validation', () => {
    it('should never return the same window as input', () => {
      const windows: Array<ExtensionProperties['releaseReviewTargetWindow']> = [
        'Morning',
        'Afternoon',
        'Evening',
        'Night',
      ];

      windows.forEach((window) => {
        const result = additionalTargetWindow(window);
        expect(result).not.toBe(window);
      });
    });

    it('should always return a valid window type', () => {
      const validWindows: Array<
        ExtensionProperties['releaseReviewTargetWindow']
      > = ['Morning', 'Afternoon', 'Evening', 'Night'];
      const inputWindows: Array<
        ExtensionProperties['releaseReviewTargetWindow']
      > = ['Morning', 'Afternoon', 'Evening', 'Night'];

      inputWindows.forEach((window) => {
        const result = additionalTargetWindow(window);
        expect(validWindows).toContain(result);
      });
    });

    it('should handle the special Night -> Evening transition correctly', () => {
      // Night is the last window in the array, but should go to Evening
      // This tests the special case handling in the function
      const result = additionalTargetWindow('Night');

      expect(result).toBe('Evening');
      expect(result).not.toBe('Morning'); // Should not wrap to beginning
    });
  });

  describe('Type safety and edge cases', () => {
    it('should handle all valid ExtensionProperties releaseReviewTargetWindow values', () => {
      // This test ensures the function works with all possible enum values
      const testCases: Array<{
        input: ExtensionProperties['releaseReviewTargetWindow'];
        expected: ExtensionProperties['releaseReviewTargetWindow'];
      }> = [
        { input: 'Morning', expected: 'Afternoon' },
        { input: 'Afternoon', expected: 'Evening' },
        { input: 'Evening', expected: 'Night' },
        { input: 'Night', expected: 'Evening' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = additionalTargetWindow(input);
        expect(result).toBe(expected);
      });
    });
  });
});
