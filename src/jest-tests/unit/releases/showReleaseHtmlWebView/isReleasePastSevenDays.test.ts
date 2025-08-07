import { isReleasePastSevenDays } from '@/releases/showReleaseHtmlWebView/isReleasePastSevenDays';

describe('isReleasePastSevenDays', () => {
  describe('Basic seven-day calculations', () => {
    it('should return false when release was today', () => {
      const releaseDate = new Date(2025, 0, 8); // January 8, 2025
      const currentDate = new Date(2025, 0, 8); // Same day

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(false);
    });

    it('should return false when release was exactly 6 days ago', () => {
      const releaseDate = new Date(2025, 0, 2); // January 2, 2025
      const currentDate = new Date(2025, 0, 8); // January 8, 2025 (6 days later)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(false);
    });

    it('should return true when release was exactly 7 days ago', () => {
      const releaseDate = new Date(2025, 0, 1); // January 1, 2025
      const currentDate = new Date(2025, 0, 8); // January 8, 2025 (7 days later)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(true);
    });

    it('should return true when release was more than 7 days ago', () => {
      const releaseDate = new Date(2024, 11, 25); // December 25, 2024
      const currentDate = new Date(2025, 0, 8); // January 8, 2025 (14 days later)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(true);
    });
  });

  describe('Real-world release notification scenarios', () => {
    it('should trigger additional window for user who missed notification for 7 days', () => {
      // Scenario: User released extension on Monday, now it's Monday next week
      const mondayRelease = new Date(2025, 0, 6); // Monday, January 6, 2025
      const nextMonday = new Date(2025, 0, 13); // Monday, January 13, 2025

      const result = isReleasePastSevenDays(mondayRelease, nextMonday);

      expect(result).toBe(true);
    });

    it('should not trigger additional window too early for users who just updated', () => {
      // Scenario: User updated 3 days ago, should still be in primary window period
      const releaseDate = new Date(2025, 0, 5); // January 5, 2025
      const currentDate = new Date(2025, 0, 8); // January 8, 2025 (3 days later)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(false);
    });

    it('should handle weekend release followed by weekday check', () => {
      // Scenario: Released on Saturday, checking the following Sunday (8 days later)
      const saturdayRelease = new Date(2025, 0, 4); // Saturday, January 4, 2025
      const nextSunday = new Date(2025, 0, 12); // Sunday, January 12, 2025

      const result = isReleasePastSevenDays(saturdayRelease, nextSunday);

      expect(result).toBe(true);
    });

    it('should work correctly for month boundary crossings', () => {
      // Scenario: Released at end of December, checking in January
      const decemberRelease = new Date(2024, 11, 25); // December 25, 2024
      const januaryCheck = new Date(2025, 0, 2); // January 2, 2025 (8 days later)

      const result = isReleasePastSevenDays(decemberRelease, januaryCheck);

      expect(result).toBe(true);
    });

    it('should work correctly for year boundary crossings', () => {
      // Scenario: Released in 2024, checking in 2025
      const release2024 = new Date(2024, 11, 20); // December 20, 2024
      const check2025 = new Date(2025, 0, 5); // January 5, 2025 (16 days later)

      const result = isReleasePastSevenDays(release2024, check2025);

      expect(result).toBe(true);
    });
  });

  describe('Precise timing and edge cases', () => {
    it('should handle exact 7-day boundary with hours and minutes', () => {
      // Exactly 7 * 24 hours = 168 hours later
      const releaseDate = new Date(2025, 0, 1, 10, 30, 0); // Jan 1, 10:30 AM
      const currentDate = new Date(2025, 0, 8, 10, 30, 0); // Jan 8, 10:30 AM (exactly 7 days)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(true);
    });

    it('should return false when 1 minute before 7-day boundary', () => {
      const releaseDate = new Date(2025, 0, 1, 10, 30, 0); // Jan 1, 10:30 AM
      const currentDate = new Date(2025, 0, 8, 10, 29, 59); // Jan 8, 10:29:59 AM (1 second short of 7 days)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(false);
    });

    it('should return true when 1 minute after 7-day boundary', () => {
      const releaseDate = new Date(2025, 0, 1, 10, 30, 0); // Jan 1, 10:30 AM
      const currentDate = new Date(2025, 0, 8, 10, 31, 0); // Jan 8, 10:31 AM (1 minute past 7 days)

      const result = isReleasePastSevenDays(releaseDate, currentDate);

      expect(result).toBe(true);
    });

    it('should handle future release dates correctly', () => {
      // Edge case: What if release date is in the future?
      const futureRelease = new Date(2025, 0, 15); // January 15, 2025
      const currentDate = new Date(2025, 0, 8); // January 8, 2025

      const result = isReleasePastSevenDays(futureRelease, currentDate);

      expect(result).toBe(false);
    });
  });

  describe('Default parameter behavior', () => {
    beforeEach(() => {
      // Mock Date.now() to ensure consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 8, 12, 0, 0)); // January 8, 2025, 12:00 PM
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should use current date when currentDate parameter is not provided', () => {
      const releaseDate = new Date(2025, 0, 1); // January 1, 2025
      // currentDate not provided, should use mocked current time (January 8, 2025)

      const result = isReleasePastSevenDays(releaseDate);

      expect(result).toBe(true);
    });

    it('should use provided currentDate when both parameters are provided', () => {
      const releaseDate = new Date(2025, 0, 1); // January 1, 2025
      const explicitCurrentDate = new Date(2025, 0, 5); // January 5, 2025 (only 4 days later)

      const result = isReleasePastSevenDays(releaseDate, explicitCurrentDate);

      expect(result).toBe(false);
    });
  });

  describe('Millisecond precision calculations', () => {
    it('should calculate exactly 7 days in milliseconds correctly', () => {
      const releaseDate = new Date(2025, 0, 1, 0, 0, 0, 0); // Jan 1, exactly midnight
      const exactlySevenDaysLater = new Date(2025, 0, 8, 0, 0, 0, 0); // Jan 8, exactly midnight

      const result = isReleasePastSevenDays(releaseDate, exactlySevenDaysLater);

      expect(result).toBe(true);
    });

    it('should handle millisecond precision correctly', () => {
      const releaseDate = new Date(2025, 0, 1, 0, 0, 0, 500); // Jan 1, 500ms past midnight
      const almostSevenDays = new Date(2025, 0, 8, 0, 0, 0, 499); // Jan 8, 499ms past midnight

      const result = isReleasePastSevenDays(releaseDate, almostSevenDays);

      expect(result).toBe(false); // Should be 1ms short of 7 days
    });
  });
});
