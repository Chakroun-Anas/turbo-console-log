import { targetWindowDate } from '@/releases/showReleaseHtmlWebView/targetWindowDate';
import { ExtensionProperties } from '@/entities';

describe('targetWindowDate', () => {
  describe('Morning window (7 AM - 12 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Morning';

    it('should return today at 7 AM when current time is before 7 AM', () => {
      const currentTime = new Date(2025, 0, 15, 5, 30, 0); // 5:30 AM on Jan 15

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 7, 0, 0)); // Same day, 7:00 AM
    });

    it('should return next day at 7 AM when current time is after Morning window (2:30 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 14, 30, 0); // 2:30 PM on Jan 15 (outside 7AM-12PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 7, 0, 0)); // Next day, 7:00 AM
    });

    it('should handle edge case at 6:59 AM (just before window)', () => {
      const currentTime = new Date(2025, 0, 15, 6, 59, 0); // 6:59 AM

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 7, 0, 0)); // Same day, 7:00 AM
    });

    it('should return next day at 7 AM when current time is just after Morning window (12:01 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 12, 1, 0); // 12:01 PM (just after 7AM-12PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 7, 0, 0)); // Next day, 7:00 AM
    });

    it('should handle late night time (3 AM) - outside Morning window', () => {
      const currentTime = new Date(2025, 0, 15, 3, 0, 0); // 3:00 AM

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 7, 0, 0)); // Same day, 7:00 AM
    });
  });

  describe('Afternoon window (13 PM - 5 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Afternoon';

    it('should return today at 13 PM when current time is before 13 PM', () => {
      const currentTime = new Date(2025, 0, 15, 9, 30, 0); // 9:30 AM (outside 12PM-5PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 13, 0, 0)); // Same day, 13:00 PM
    });

    it('should return next day at 13 PM when current time is after Afternoon window (6:45 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 18, 45, 0); // 6:45 PM (outside 12PM-5PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 13, 0, 0)); // Next day, 13:00 PM
    });

    it('should handle edge case at 12:59 PM (just before Afternoon window)', () => {
      const currentTime = new Date(2025, 0, 15, 12, 59, 0); // 11:59 PM

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 13, 0, 0)); // Same day, 13:00 PM
    });

    it('should return next day at 13 PM when current time is just after Afternoon window (5:01 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 17, 1, 0); // 5:01 PM (just after 13PM-5PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 13, 0, 0)); // Next day, 13:00 PM
    });
  });

  describe('Evening window (5 PM - 9 PM)', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Evening';

    it('should return today at 5 PM when current time is before Evening window (1:15 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 13, 15, 0); // 1:15 PM (outside 5PM-9PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 17, 0, 0)); // Same day, 5:00 PM
    });

    it('should return next day at 5 PM when current time is after Evening window (10:30 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 22, 30, 0); // 10:30 PM (outside 5PM-9PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 17, 0, 0)); // Next day, 5:00 PM
    });

    it('should handle morning time before Evening window (8:00 AM)', () => {
      const currentTime = new Date(2025, 0, 15, 8, 0, 0); // 8:00 AM (outside 5PM-9PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 17, 0, 0)); // Same day, 5:00 PM
    });

    it('should return next day at 5 PM when current time is just after Evening window (9:01 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 21, 1, 0); // 9:01 PM (just after 5PM-9PM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 17, 0, 0)); // Next day, 5:00 PM
    });
  });

  describe('Night window (9 PM - 2 AM) - special case', () => {
    const targetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
      'Night';

    it('should return today at 9 PM when current time is outside Night window (morning - 8:00 AM)', () => {
      const currentTime = new Date(2025, 0, 15, 8, 0, 0); // 8:00 AM (outside 9PM-2AM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should return today at 9 PM when current time is outside Night window (afternoon - 3:30 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 15, 30, 0); // 3:30 PM (outside 9PM-2AM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should return today at 9 PM when current time is outside Night window (early morning - 3:00 AM)', () => {
      const currentTime = new Date(2025, 0, 15, 3, 0, 0); // 3:00 AM (outside 9PM-2AM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should return today at 9 PM when current time is just before Night window (8:59 PM)', () => {
      const currentTime = new Date(2025, 0, 15, 20, 59, 0); // 8:59 PM (just before 9PM-2AM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should return today at 9 PM when current time is just after Night window (2:01 AM)', () => {
      const currentTime = new Date(2025, 0, 15, 2, 1, 0); // 2:01 AM (just after 9PM-2AM window)

      const result = targetWindowDate(targetWindow, currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });
  });

  describe('Default behavior and edge cases', () => {
    it('should use current time when no time parameter provided', () => {
      const mockDate = new Date(2025, 0, 15, 10, 30, 0); // 10:30 AM
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const result = targetWindowDate('Morning');

      expect(result).toEqual(new Date(2025, 0, 16, 7, 0, 0)); // Next day at 7 AM

      jest.useRealTimers();
    });

    it('should default to Night window for invalid target window (testing switch default case)', () => {
      const currentTime = new Date(2025, 0, 15, 14, 0, 0); // 2:00 PM

      // Testing the default case of the switch statement
      const result = targetWindowDate(
        'Random' as ExtensionProperties['releaseReviewTargetWindow'],
        currentTime,
      );

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should handle month boundary correctly (end of month)', () => {
      const currentTime = new Date(2025, 0, 31, 20, 0, 0); // Jan 31, 8:00 PM

      const result = targetWindowDate('Morning', currentTime);

      expect(result).toEqual(new Date(2025, 1, 1, 7, 0, 0)); // Feb 1, 7:00 AM
    });

    it('should handle year boundary correctly (end of year)', () => {
      const currentTime = new Date(2024, 11, 31, 20, 0, 0); // Dec 31, 2024, 8:00 PM

      const result = targetWindowDate('Morning', currentTime);

      expect(result).toEqual(new Date(2025, 0, 1, 7, 0, 0)); // Jan 1, 2025, 7:00 AM
    });

    it('should handle leap year correctly', () => {
      const currentTime = new Date(2024, 1, 28, 20, 0, 0); // Feb 28, 2024 (leap year), 8:00 PM

      const result = targetWindowDate('Morning', currentTime);

      expect(result).toEqual(new Date(2024, 1, 29, 7, 0, 0)); // Feb 29, 2024, 7:00 AM
    });
  });

  describe('Realistic calling context scenarios', () => {
    it('should handle Morning window when called at 1 PM (outside morning window)', () => {
      const currentTime = new Date(2025, 0, 15, 13, 0, 0); // 1:00 PM

      const result = targetWindowDate('Morning', currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 7, 0, 0)); // Next day, 7:00 AM
    });

    it('should handle Afternoon window when called at 6 PM (outside afternoon window)', () => {
      const currentTime = new Date(2025, 0, 15, 18, 0, 0); // 6:00 PM

      const result = targetWindowDate('Afternoon', currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 13, 0, 0)); // Next day, 13:00 PM
    });

    it('should handle Evening window when called at 10 PM (outside evening window)', () => {
      const currentTime = new Date(2025, 0, 15, 22, 0, 0); // 10:00 PM

      const result = targetWindowDate('Evening', currentTime);

      expect(result).toEqual(new Date(2025, 0, 16, 17, 0, 0)); // Next day, 5:00 PM
    });

    it('should handle Night window when called at 3 AM (outside night window)', () => {
      const currentTime = new Date(2025, 0, 15, 3, 0, 0); // 3:00 AM

      const result = targetWindowDate('Night', currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });

    it('should handle Night window when called at 8 PM (outside night window)', () => {
      const currentTime = new Date(2025, 0, 15, 20, 0, 0); // 8:00 PM

      const result = targetWindowDate('Night', currentTime);

      expect(result).toEqual(new Date(2025, 0, 15, 21, 0, 0)); // Same day, 9:00 PM
    });
  });

  describe('Time precision tests', () => {
    it('should set minutes and seconds to 0', () => {
      const currentTime = new Date(2025, 0, 15, 10, 45, 30); // 10:45:30 AM

      const result = targetWindowDate('Afternoon', currentTime);

      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve date components correctly', () => {
      const currentTime = new Date(2025, 5, 20, 10, 45, 30); // June 20, 2025, 10:45:30 AM

      const result = targetWindowDate('Afternoon', currentTime);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5); // June
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(13);
    });
  });
});
