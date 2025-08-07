import { isCurrentTimeWithinReleaseReviewWindow } from '@/releases/showReleaseHtmlWebView/isCurrentTimeWithinReleaseReviewWindow';
import { ExtensionProperties } from '@/entities';

describe('isCurrentTimeWithinReleaseReviewWindow', () => {
  describe('Morning window (7 AM - 12 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Morning';

    it('should return true when current time is at window start (7 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 7, 0, 0); // 7:00 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is within window (10 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 10, 30, 0); // 10:30 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return false when current time is at window end (12 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 12, 0, 0); // 12:00 PM (noon)

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is before window (6 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 6, 59, 0); // 6:59 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is after window (1 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 13, 0, 0); // 1:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });
  });

  describe('Afternoon window (1 PM - 5 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Afternoon';

    it('should return true when current time is at window start (1 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 13, 0, 0); // 1:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is within window (3 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 15, 45, 0); // 3:45 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return false when current time is at window end (5 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 17, 0, 0); // 5:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is before window (11 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 11, 59, 0); // 11:59 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is after window (6 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 18, 0, 0); // 6:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });
  });

  describe('Evening window (5 PM - 9 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Evening';

    it('should return true when current time is at window start (5 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 17, 0, 0); // 5:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is within window (7 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 19, 30, 0); // 7:30 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return false when current time is at window end (9 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 21, 0, 0); // 9:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is before window (4 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 16, 59, 0); // 4:59 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is after window (10 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 22, 0, 0); // 10:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });
  });

  describe('Night window (9 PM - 2 AM) - wraps around midnight', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Night';

    it('should return true when current time is at window start (9 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 21, 0, 0); // 9:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is late night (11 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 23, 30, 0); // 11:30 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is midnight', () => {
      const currentTime = new Date(2025, 0, 1, 0, 0, 0); // 12:00 AM (midnight)

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return true when current time is early morning within window (1 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 1, 30, 0); // 1:30 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(true);
    });

    it('should return false when current time is at window end (2 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 2, 0, 0); // 2:00 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is outside window (8 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 20, 59, 0); // 8:59 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is outside window (3 AM)', () => {
      const currentTime = new Date(2025, 0, 1, 3, 0, 0); // 3:00 AM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });

    it('should return false when current time is during day hours (2 PM)', () => {
      const currentTime = new Date(2025, 0, 1, 14, 0, 0); // 2:00 PM

      const result = isCurrentTimeWithinReleaseReviewWindow(
        targetWindow,
        currentTime,
      );

      expect(result).toBe(false);
    });
  });

  describe('Edge cases and defaults', () => {
    it('should use current time when no date parameter is provided', () => {
      // Mock current time to be within Morning window
      const mockDate = new Date(2025, 0, 1, 8, 0, 0); // 8:00 AM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = isCurrentTimeWithinReleaseReviewWindow('Morning');

      expect(result).toBe(true);

      jest.restoreAllMocks();
    });

    it('should handle edge case at exact minute boundaries', () => {
      // Test exact boundary conditions with minutes and seconds
      const morningWindowStart = new Date(2025, 0, 1, 7, 0, 0); // Exactly 7:00:00 AM
      const morningWindowEnd = new Date(2025, 0, 1, 11, 59, 59); // 11:59:59 AM
      const justAfterEnd = new Date(2025, 0, 1, 12, 0, 0); // Exactly 12:00:00 PM

      expect(
        isCurrentTimeWithinReleaseReviewWindow('Morning', morningWindowStart),
      ).toBe(true);
      expect(
        isCurrentTimeWithinReleaseReviewWindow('Morning', morningWindowEnd),
      ).toBe(true);
      expect(
        isCurrentTimeWithinReleaseReviewWindow('Morning', justAfterEnd),
      ).toBe(false);
    });
  });

  describe('All window types boundary testing', () => {
    const testCases: Array<{
      window: ExtensionProperties['releaseReviewTargetWindow'];
      withinTimes: Date[];
      outsideTimes: Date[];
    }> = [
      {
        window: 'Morning',
        withinTimes: [
          new Date(2025, 0, 1, 7, 0, 0), // 7:00 AM
          new Date(2025, 0, 1, 9, 30, 0), // 9:30 AM
          new Date(2025, 0, 1, 11, 59, 0), // 11:59 AM
        ],
        outsideTimes: [
          new Date(2025, 0, 1, 6, 59, 0), // 6:59 AM
          new Date(2025, 0, 1, 12, 0, 0), // 12:00 PM
          new Date(2025, 0, 1, 15, 0, 0), // 3:00 PM
        ],
      },
      {
        window: 'Afternoon',
        withinTimes: [
          new Date(2025, 0, 1, 13, 0, 0), // 1:00 PM
          new Date(2025, 0, 1, 14, 30, 0), // 2:30 PM
          new Date(2025, 0, 1, 16, 59, 0), // 4:59 PM
        ],
        outsideTimes: [
          new Date(2025, 0, 1, 12, 59, 0), // 12:59 PM
          new Date(2025, 0, 1, 17, 0, 0), // 5:00 PM
          new Date(2025, 0, 1, 20, 0, 0), // 8:00 PM
        ],
      },
      {
        window: 'Evening',
        withinTimes: [
          new Date(2025, 0, 1, 17, 0, 0), // 5:00 PM
          new Date(2025, 0, 1, 19, 30, 0), // 7:30 PM
          new Date(2025, 0, 1, 20, 59, 0), // 8:59 PM
        ],
        outsideTimes: [
          new Date(2025, 0, 1, 16, 59, 0), // 4:59 PM
          new Date(2025, 0, 1, 21, 0, 0), // 9:00 PM
          new Date(2025, 0, 1, 23, 0, 0), // 11:00 PM
        ],
      },
      {
        window: 'Night',
        withinTimes: [
          new Date(2025, 0, 1, 21, 0, 0), // 9:00 PM
          new Date(2025, 0, 1, 23, 30, 0), // 11:30 PM
          new Date(2025, 0, 1, 0, 30, 0), // 12:30 AM
          new Date(2025, 0, 1, 1, 59, 0), // 1:59 AM
        ],
        outsideTimes: [
          new Date(2025, 0, 1, 20, 59, 0), // 8:59 PM
          new Date(2025, 0, 1, 2, 0, 0), // 2:00 AM
          new Date(2025, 0, 1, 10, 0, 0), // 10:00 AM
        ],
      },
    ];

    testCases.forEach(({ window, withinTimes, outsideTimes }) => {
      describe(`${window} window comprehensive boundary tests`, () => {
        withinTimes.forEach((time, index) => {
          it(`should return true for within time #${index + 1} (${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')})`, () => {
            const result = isCurrentTimeWithinReleaseReviewWindow(window, time);
            expect(result).toBe(true);
          });
        });

        outsideTimes.forEach((time, index) => {
          it(`should return false for outside time #${index + 1} (${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')})`, () => {
            const result = isCurrentTimeWithinReleaseReviewWindow(window, time);
            expect(result).toBe(false);
          });
        });
      });
    });
  });
});
