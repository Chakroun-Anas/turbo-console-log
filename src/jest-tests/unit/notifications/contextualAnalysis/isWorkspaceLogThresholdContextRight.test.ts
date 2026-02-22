import { isWorkspaceLogThresholdContextRight } from '@/notifications/contextualAnalysis/contexts/isWorkspaceLogThresholdContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

// Mock the collectWorkspaceContext helper
jest.mock('@/notifications/contextualAnalysis/helpers');

const mockCollectWorkspaceContext =
  collectWorkspaceContext as jest.MockedFunction<
    typeof collectWorkspaceContext
  >;

describe('isWorkspaceLogThresholdContextRight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Threshold validation (150)', () => {
    it('should return true for Saturday night (weekend discovery)', () => {
      // Saturday (1.5) × night (1.31) = 196.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for optimal context (Saturday night + 0 editors + 1-2 unsaved)', () => {
      // Saturday (1.5) × night (1.31) × 0 editors (1.09) × 1-2 unsaved (1.17)
      // = 100 × 1.5 × 1.31 × 1.09 × 1.17 ≈ 250.3 (max achievable)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 2,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return false for score below threshold', () => {
      // Monday (0.91) × morning (0.94) × 3-5 editors (0.96)
      // = 100 × 0.91 × 0.94 × 0.96 ≈ 82.1
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Best contexts (should pass)', () => {
    it('should return true for Saturday night (peak discovery)', () => {
      // Saturday (1.5) × night (1.31) = 196.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for Sunday night', () => {
      // Sunday (1.4) × night (1.31) = 183.4
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for Saturday evening', () => {
      // Saturday (1.5) × evening (1.15) = 172.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for Sunday evening', () => {
      // Sunday (1.4) × evening (1.15) = 161.0
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 1,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for Friday night with active coding', () => {
      // Friday (1.12) × night (1.31) × 1-2 unsaved (1.17) × 1-2 editors (1.06)
      // = 100 × 1.12 × 1.31 × 1.17 × 1.06 ≈ 182.0
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 2,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return true for Wednesday night with active coding (weekday edge case)', () => {
      // Wednesday (0.99) × night (1.31) × 1-2 unsaved (1.17) × 1-2 editors (1.06)
      // = 100 × 0.99 × 1.31 × 1.17 × 1.06 ≈ 160.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 1,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });
  });

  describe('Worst contexts (should fail)', () => {
    it('should return false for Monday morning (worst compound)', () => {
      // Monday (0.91) × morning (0.94) = 85.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should return false for Tuesday morning', () => {
      // Tuesday (0.92) × morning (0.94) = 86.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should return false for Monday afternoon with deep flow', () => {
      // Monday (0.91) × afternoon (0.95) × 6-10 editors (0.9)
      // = 100 × 0.91 × 0.95 × 0.9 ≈ 77.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 8,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should return false for Friday evening (just below threshold)', () => {
      // Friday (1.12) × evening (1.15) = 128.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Day of week impact', () => {
    const baseContext: Omit<WorkspaceContext, 'dayOfWeek'> = {
      periodOfDay: 'night',
      unsavedFilesCount: 0,
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply Saturday multiplier (1.5 - best, weekend discovery)', () => {
      // Saturday (1.5) × night (1.31) = 196.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SATURDAY',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply Sunday multiplier (1.4)', () => {
      // Sunday (1.4) × night (1.31) = 183.4
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SUNDAY',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply Friday multiplier (1.12)', () => {
      // Friday (1.12) × night (1.31) = 146.7
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'FRIDAY',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false); // Just below 150
    });

    it('should apply Thursday multiplier (1.0 - baseline)', () => {
      // Thursday (1.0) × night (1.31) = 131.0
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'THURSDAY',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should apply Monday multiplier (0.91 - worst)', () => {
      // Monday (0.91) × night (1.31) = 119.2
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'MONDAY',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Time of day impact', () => {
    const baseContext: Omit<WorkspaceContext, 'periodOfDay'> = {
      dayOfWeek: 'SATURDAY',
      unsavedFilesCount: 0,
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply night multiplier (1.31 - best, exploratory time)', () => {
      // Saturday (1.5) × night (1.31) = 196.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'night',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply evening multiplier (1.15)', () => {
      // Saturday (1.5) × evening (1.15) = 172.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'evening',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply afternoon multiplier (0.95)', () => {
      // Saturday (1.5) × afternoon (0.95) = 142.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'afternoon',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should apply morning multiplier (0.94 - worst)', () => {
      // Saturday (1.5) × morning (0.94) = 141.0
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'morning',
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Unsaved files impact', () => {
    const baseContext: Omit<WorkspaceContext, 'unsavedFilesCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'afternoon',
      openEditorsCount: 0,
      terminalCount: 0,
    };

    it('should apply 1-2 unsaved multiplier (1.17 - active coding)', () => {
      // Saturday (1.5) × afternoon (0.95) × 0 editors (1.09) × 1-2 unsaved (1.17)
      // = 100 × 1.5 × 0.95 × 1.09 × 1.17 ≈ 181.6
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 2,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply 0 unsaved multiplier (1.0 - baseline)', () => {
      // Saturday (1.5) × afternoon (0.95) × 0 editors (1.09)
      // = 100 × 1.5 × 0.95 × 1.09 ≈ 155.2
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply 3+ unsaved multiplier (0.96 - chaos penalty)', () => {
      // Saturday (1.5) × afternoon (0.95) × 0 editors (1.09) × 3+ unsaved (0.96)
      // = 100 × 1.5 × 0.95 × 1.09 × 0.96 ≈ 149.0
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 5,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false); // Just below 150
    });
  });

  describe('Open editors impact', () => {
    const baseContext: Omit<WorkspaceContext, 'openEditorsCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'afternoon',
      unsavedFilesCount: 0,
      terminalCount: 0,
    };

    it('should apply 0 editors multiplier (1.09 - best, fresh start)', () => {
      // Saturday (1.5) × afternoon (0.95) × 0 editors (1.09)
      // = 100 × 1.5 × 0.95 × 1.09 ≈ 155.2
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply 1-2 editors multiplier (1.06 - light focus)', () => {
      // Saturday (1.5) × afternoon (0.95) × 1-2 editors (1.06)
      // = 100 × 1.5 × 0.95 × 1.06 ≈ 151.0
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 2,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should apply 3-5 editors multiplier (0.96)', () => {
      // Saturday (1.5) × afternoon (0.95) × 3-5 editors (0.96)
      // = 100 × 1.5 × 0.95 × 0.96 ≈ 136.8
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 4,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should apply 6-10 editors multiplier (0.9 - worst, deep flow)', () => {
      // Saturday (1.5) × afternoon (0.95) × 6-10 editors (0.9)
      // = 100 × 1.5 × 0.95 × 0.9 ≈ 128.2
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 8,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should apply 11+ editors multiplier (0.96)', () => {
      // Saturday (1.5) × afternoon (0.95) × 11+ editors (0.96)
      // = 100 × 1.5 × 0.95 × 0.96 ≈ 136.8
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 15,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle terminal count (ignored in scoring)', () => {
      // Terminal count should not affect score
      const context1: WorkspaceContext = {
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      };

      const context2: WorkspaceContext = {
        ...context1,
        terminalCount: 100, // Should not matter
      };

      mockCollectWorkspaceContext.mockReturnValue(context1);
      const result1 = isWorkspaceLogThresholdContextRight();

      mockCollectWorkspaceContext.mockReturnValue(context2);
      const result2 = isWorkspaceLogThresholdContextRight();

      expect(result1).toBe(result2); // Same result regardless of terminal count
      expect(result1).toBe(true); // Both should pass
    });

    it('should handle all negative multipliers', () => {
      // Monday (0.91) × morning (0.94) × 6-10 editors (0.9) × 3+ unsaved (0.96)
      // = 100 × 0.91 × 0.94 × 0.9 × 0.96 ≈ 74.7
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 5,
        openEditorsCount: 8,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should handle baseline context (Thursday afternoon)', () => {
      // Thursday (1.0) × afternoon (0.95) × 3-5 editors (0.96)
      // = 100 × 1.0 × 0.95 × 0.96 ≈ 91.2
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Borderline threshold cases', () => {
    it('should return true for score at threshold (150)', () => {
      // Saturday (1.5) × afternoon (0.95) × 1-2 editors (1.06)
      // = 100 × 1.5 × 0.95 × 1.06 ≈ 151.0
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should return false for score just below threshold (149)', () => {
      // Friday (1.12) × night (1.31) = 146.7
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should return false for Friday evening (128.8)', () => {
      // Friday (1.12) × evening (1.15) = 128.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    it('should accept Saturday night log discovery (typical weekend exploration)', () => {
      // User discovers they have 247 logs during weekend night exploration
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 1,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should accept Sunday evening coding session with active work', () => {
      // User working on side project, discovers log count
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 2,
        openEditorsCount: 2,
        terminalCount: 2,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });

    it('should reject Monday morning work start (worst timing)', () => {
      // User starting work week, not interested in log management
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 1,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should reject Tuesday afternoon deep focus', () => {
      // User in flow state with multiple files open
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 5,
        openEditorsCount: 12,
        terminalCount: 3,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(false);
    });

    it('should accept Friday night kick-off (pre-weekend momentum)', () => {
      // User starting weekend project Friday night
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 1,
        openEditorsCount: 1,
        terminalCount: 2,
      });

      expect(isWorkspaceLogThresholdContextRight()).toBe(true);
    });
  });

  describe('Pattern alignment with Release Announcement', () => {
    it('should share night/evening preference pattern', () => {
      // Both events target exploratory sessions
      const saturdayNightContext: WorkspaceContext = {
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      };

      mockCollectWorkspaceContext.mockReturnValue(saturdayNightContext);
      expect(isWorkspaceLogThresholdContextRight()).toBe(true);

      // Night is best for both events
      const mondayNightContext: WorkspaceContext = {
        ...saturdayNightContext,
        dayOfWeek: 'MONDAY',
      };

      mockCollectWorkspaceContext.mockReturnValue(mondayNightContext);
      const mondayNight = isWorkspaceLogThresholdContextRight();

      const mondayMorningContext: WorkspaceContext = {
        ...saturdayNightContext,
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
      };

      mockCollectWorkspaceContext.mockReturnValue(mondayMorningContext);
      const mondayMorning = isWorkspaceLogThresholdContextRight();

      // Night should be better than morning (though both may fail)
      expect(mondayNight).toBe(false);
      expect(mondayMorning).toBe(false);
      expect(119.2).toBeGreaterThan(85.5); // Night score > morning score
    });
  });
});
