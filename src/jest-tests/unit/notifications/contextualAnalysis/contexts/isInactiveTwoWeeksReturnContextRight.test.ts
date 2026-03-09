import { isInactiveTwoWeeksReturnContextRight } from '@/notifications/contextualAnalysis/contexts/isInactiveTwoWeeksReturnContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';

jest.mock('@/notifications/contextualAnalysis/helpers');

describe('isInactiveTwoWeeksReturnContextRight', () => {
  const mockCollectWorkspaceContext =
    collectWorkspaceContext as jest.MockedFunction<
      typeof collectWorkspaceContext
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('threshold validation (100)', () => {
    it('should return true for optimal context (Monday night - maximum achievable)', () => {
      // Monday (1.23) × night (1.42) = 174.7 (max achievable)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return true for Sunday night (above threshold)', () => {
      // Sunday (1.06) × night (1.42) = 150.5 (above 100 threshold)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return true for score at threshold boundary', () => {
      // Monday (1.23) × morning (0.99) = 121.8 (above 100 threshold)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return false for score well below threshold', () => {
      // Wednesday (0.86) × evening (0.72) = 61.9
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });
  });

  describe('best contexts (should pass)', () => {
    it('should return true for Monday night (peak re-engagement)', () => {
      // Monday (1.23) × night (1.42) = 174.7 ✅
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 3,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return true for Sunday night (fresh weekend start)', () => {
      // Sunday (1.06) × night (1.42) = 150.5 ✅
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return true for Tuesday night (still good night effect)', () => {
      // Tuesday (0.99) × night (1.42) = 140.6 ✅ (passes)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return true for Thursday night', () => {
      // Thursday (0.99) × night (1.42) = 140.6 ✅ (passes)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 10,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });
  });

  describe('worst contexts (should fail)', () => {
    it('should return false for Wednesday evening (double penalty)', () => {
      // Wednesday (0.86) × evening (0.72) = 61.9 ❌ (worst combination)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should return false for Saturday evening', () => {
      // Saturday (0.86) × evening (0.72) = 61.9 ❌
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should return false for Friday evening', () => {
      // Friday (0.94) × evening (0.72) = 67.7 ❌
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should return true for Monday morning (above threshold now)', () => {
      // Monday (1.23) × morning (0.99) = 121.8 ✅ (above 100 threshold)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should return false for Saturday morning', () => {
      // Saturday (0.86) × morning (0.99) = 85.1 ❌
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });
  });

  describe('time of day impact', () => {
    it('should strongly prefer night time (highest multiplier: 1.42)', () => {
      // Night time with any decent day should pass
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Friday (0.94) × night (1.42) = 133.5 ✅ (above 100)
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should heavily penalize evening (lowest multiplier: 0.72)', () => {
      // Even best day + evening fails
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Monday (1.23) × evening (0.72) = 88.6 ❌
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should treat morning as near-neutral (0.99)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Sunday (1.06) × morning (0.99) = 104.9 ✅ (above 100 threshold)
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should treat afternoon as slightly negative (0.97)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Monday (1.23) × afternoon (0.97) = 119.3 ✅ (above 100)
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });
  });

  describe('day of week impact', () => {
    it('should strongly prefer Monday (highest multiplier: 1.23)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        openEditorsCount: 10,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });

      // Monday (1.23) × night (1.42) = 174.7 ✅
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should moderately prefer Sunday (1.06)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Sunday (1.06) × night (1.42) = 150.5 ✅
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should treat Tuesday/Thursday as neutral (0.99)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Tuesday (0.99) × afternoon (0.97) = 96.0 ❌
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should penalize Friday (0.94)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Friday (0.94) × morning (0.99) = 93.1 ❌
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should heavily penalize Wednesday and Saturday (0.86)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Wednesday (0.86) × morning (0.99) = 85.1 ❌
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });
  });

  describe('borderline cases', () => {
    it('should pass when score is well above threshold (100)', () => {
      // Tuesday (0.99) × night (1.42) = 140.6 ✅ (above 100)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should pass when score is above threshold', () => {
      // Friday (0.94) × night (1.42) = 133.5 ✅ (above 100)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should ignore irrelevant context metrics (openEditorsCount)', () => {
      // Same conditions with different openEditorsCount should yield same result
      const dayOfWeek = 'MONDAY';
      const periodOfDay = 'night';

      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek,
        periodOfDay,
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      const result1 = isInactiveTwoWeeksReturnContextRight();

      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek,
        periodOfDay,
        openEditorsCount: 100,
        unsavedFilesCount: 5,
        terminalCount: 10,
      });
      const result2 = isInactiveTwoWeeksReturnContextRight();

      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should pass for "Monday night late coding session"', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        openEditorsCount: 3,
        unsavedFilesCount: 1,
        terminalCount: 2,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should pass for "Sunday night side project start"', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should fail for "Wednesday afternoon quick check"', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should fail for "Friday evening winding down"', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        openEditorsCount: 8,
        unsavedFilesCount: 2,
        terminalCount: 3,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should fail for "Tuesday morning standup"', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });
  });

  describe('pattern validation: "Monday Night Re-engagement"', () => {
    it('should validate that night is the strongest time predictor', () => {
      // Night with worst day (Saturday 0.86) = 122.1
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      // Passes with new lower threshold
      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should validate that both night AND good day provide best results', () => {
      // Best day (Monday) with worst time (evening) = 88.6
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(false);
    });

    it('should validate that night boosts all days above threshold now', () => {
      // Night (1.42) now brings even weaker days above 100 threshold
      // Friday (0.94) × night (1.42) = 133.5 ✅
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
    });

    it('should validate Monday-Thursday nights all pass', () => {
      const passingDays = ['MONDAY', 'TUESDAY', 'THURSDAY'] as const;

      passingDays.forEach((day) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: day,
          periodOfDay: 'night',
          openEditorsCount: 0,
          unsavedFilesCount: 0,
          terminalCount: 0,
        });

        expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
      });
    });

    it('should validate all nights now pass with threshold at 100', () => {
      const allDays = [
        'FRIDAY',
        'SATURDAY',
        'WEDNESDAY',
        'MONDAY',
        'TUESDAY',
        'THURSDAY',
        'SUNDAY',
      ] as const;

      allDays.forEach((day) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: day,
          periodOfDay: 'night',
          openEditorsCount: 0,
          unsavedFilesCount: 0,
          terminalCount: 0,
        });

        expect(isInactiveTwoWeeksReturnContextRight()).toBe(true);
      });
    });
  });
});
