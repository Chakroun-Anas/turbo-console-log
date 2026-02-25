import { isWeekendTurboSundaysContextRight } from '@/notifications/contextualAnalysis/contexts/isWeekendTurboSundaysContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

// Mock the collectWorkspaceContext helper
jest.mock('@/notifications/contextualAnalysis/helpers');

const mockCollectWorkspaceContext =
  collectWorkspaceContext as jest.MockedFunction<
    typeof collectWorkspaceContext
  >;

describe('isWeekendTurboSundaysContextRight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Threshold validation (130)', () => {
    it('should return true for optimal context (Sunday morning + 0 editors)', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11)
      // = 100 × 1.1 × 1.1 × 1.11 ≈ 134.3 (max achievable)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should return false for Sunday morning + 1-2 editors (below threshold)', () => {
      // Sunday (1.1) × morning (1.1) × 1-2 editors (0.98)
      // = 100 × 1.1 × 1.1 × 0.98 ≈ 118.6 (below 130 threshold)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 1,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should return false for score below threshold', () => {
      // Saturday (0.95) × afternoon (0.97) × 3-5 editors (1.05)
      // = 100 × 0.95 × 0.97 × 1.05 ≈ 96.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });
  });

  describe('Best contexts (should pass)', () => {
    it('should return true for Sunday morning + 0 editors (peak momentum)', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) = 134.3
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should return true for Sunday morning + 1-2 unsaved files', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) × 1-2 unsaved (boost from data)
      // Even without unsaved file multiplier in code, base score should pass
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 2,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });
  });

  describe('Worst contexts (should fail)', () => {
    it('should return false for Monday morning (leaked weekday event)', () => {
      // Monday (0.5) × morning (1.1) × 0 editors (1.11)
      // = 100 × 0.5 × 1.1 × 1.11 ≈ 61.05
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should return false for Saturday night (worst time)', () => {
      // Saturday (0.95) × night (0.89) × 0 editors (1.11)
      // = 100 × 0.95 × 0.89 × 1.11 ≈ 93.9
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should return false for Sunday afternoon + 6+ editors (deep focus, wrong time)', () => {
      // Sunday (1.1) × afternoon (0.97) × 6+ editors (0.9)
      // = 100 × 1.1 × 0.97 × 0.9 ≈ 96.0
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 8,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should return false for weekday (Tuesday)', () => {
      // Tuesday (0.5) × morning (1.1) × 3-5 editors (1.05)
      // = 100 × 0.5 × 1.1 × 1.05 ≈ 57.75
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });
  });

  describe('Day of week impact', () => {
    const baseContext: Omit<WorkspaceContext, 'dayOfWeek'> = {
      periodOfDay: 'morning',
      unsavedFilesCount: 0,
      openEditorsCount: 0,
      terminalCount: 0,
    };

    it('should apply Sunday multiplier (1.1 - best for "Turbo Sundays")', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) = 134.3
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SUNDAY',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should apply Saturday multiplier (0.95)', () => {
      // Saturday (0.95) × morning (1.1) × 0 editors (1.11)
      // = 100 × 0.95 × 1.1 × 1.11 ≈ 115.97
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SATURDAY',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false); // Below 130
    });

    it('should apply weekday multiplier (0.5 - event should rarely fire)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'WEDNESDAY',
      });

      const result = isWeekendTurboSundaysContextRight();
      // Score: 100 × 0.5 × 1.1 × 1.11 ≈ 61
      expect(result).toBe(false);
    });

    it('should heavily penalize Monday (0.5)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'MONDAY',
      });

      const result = isWeekendTurboSundaysContextRight();
      // Score: 100 × 0.5 × 1.1 × 1.11 ≈ 61
      expect(result).toBe(false);
    });
  });

  describe('Time of day impact', () => {
    const baseContext: Omit<WorkspaceContext, 'periodOfDay'> = {
      dayOfWeek: 'SUNDAY',
      unsavedFilesCount: 0,
      openEditorsCount: 0,
      terminalCount: 0,
    };

    it('should apply morning multiplier (1.1 - best, weekend momentum)', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) = 134.3
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'morning',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should apply evening multiplier (1.01 - neutral)', () => {
      // Sunday (1.1) × evening (1.01) × 0 editors (1.11)
      // = 100 × 1.1 × 1.01 × 1.11 ≈ 123.3
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'evening',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false); // Below 130
    });

    it('should apply afternoon multiplier (0.97 - slight penalty)', () => {
      // Sunday (1.1) × afternoon (0.97) × 0 editors (1.11)
      // = 100 × 1.1 × 0.97 × 1.11 ≈ 118.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'afternoon',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should apply night multiplier (0.89 - worst, opposite of Release Announcement)', () => {
      // Sunday (1.1) × night (0.89) × 0 editors (1.11)
      // = 100 × 1.1 × 0.89 × 1.11 ≈ 108.7
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'night',
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });
  });

  describe('Open editors impact', () => {
    const baseContext: Omit<WorkspaceContext, 'openEditorsCount'> = {
      dayOfWeek: 'SUNDAY',
      periodOfDay: 'morning',
      unsavedFilesCount: 0,
      terminalCount: 0,
    };

    it('should apply 0 editors multiplier (1.11 - best, fresh start)', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) = 134.3
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should apply 3-5 editors multiplier (1.05 - light focus)', () => {
      // Sunday (1.1) × morning (1.1) × 3-5 editors (1.05)
      // = 100 × 1.1 × 1.1 × 1.05 ≈ 127.05
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 4,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false); // Just below 130
    });

    it('should apply 1-2 editors multiplier (0.98 - slight penalty)', () => {
      // Sunday (1.1) × morning (1.1) × 1-2 editors (0.98)
      // = 100 × 1.1 × 1.1 × 0.98 ≈ 118.6
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 2,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should apply 6+ editors multiplier (0.9 - deep focus, avoid interruption)', () => {
      // Sunday (1.1) × morning (1.1) × 6+ editors (0.9)
      // = 100 × 1.1 × 1.1 × 0.9 ≈ 108.9
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 10,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should apply 6+ multiplier for 11+ editors', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 15,
      });

      const result = isWeekendTurboSundaysContextRight();
      // Score: 100 × 1.1 × 1.1 × 0.9 ≈ 108.9
      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle weekday leak (event fires incorrectly on Thursday)', () => {
      // Thursday (0.5) × morning (1.1) × 0 editors (1.11)
      // = 100 × 0.5 × 1.1 × 1.11 ≈ 61.05
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should handle all negative multipliers', () => {
      // Weekday (0.5) × night (0.89) × 6+ editors (0.9)
      // = 100 × 0.5 × 0.89 × 0.9 ≈ 40.05
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 10,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should handle terminal count (ignored in scoring)', () => {
      // Terminal count should not affect score
      const context1: WorkspaceContext = {
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      };

      const context2: WorkspaceContext = {
        ...context1,
        terminalCount: 100, // Should not matter
      };

      mockCollectWorkspaceContext.mockReturnValue(context1);
      const result1 = isWeekendTurboSundaysContextRight();

      mockCollectWorkspaceContext.mockReturnValue(context2);
      const result2 = isWeekendTurboSundaysContextRight();

      expect(result1).toBe(result2); // Same result regardless of terminal count
      expect(result1).toBe(true); // Both should pass
    });

    it('should handle unsaved files count (no multiplier in code)', () => {
      // Unsaved files should not affect score
      const context1: WorkspaceContext = {
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      };

      const context2: WorkspaceContext = {
        ...context1,
        unsavedFilesCount: 5,
      };

      mockCollectWorkspaceContext.mockReturnValue(context1);
      const result1 = isWeekendTurboSundaysContextRight();

      mockCollectWorkspaceContext.mockReturnValue(context2);
      const result2 = isWeekendTurboSundaysContextRight();

      expect(result1).toBe(result2); // Same result
      expect(result1).toBe(true);
    });
  });

  describe('Borderline threshold cases', () => {
    it('should return true for score at threshold (130)', () => {
      // Sunday (1.1) × morning (1.1) × 0 editors (1.11) = 134.3
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should return false for score just below threshold (127)', () => {
      // Sunday (1.1) × morning (1.1) × 3-5 editors (1.05) = 127.05
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should return false for Saturday morning + 0 editors (116)', () => {
      // Saturday (0.95) × morning (1.1) × 0 editors (1.11) = 115.97
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    it('should accept Sunday morning fresh start (typical side project kickoff)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 1,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(true);
    });

    it('should reject Sunday night coding session (late night, not morning momentum)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 2,
        openEditorsCount: 3,
        terminalCount: 2,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should reject Saturday afternoon deep focus (6+ editors, wrong time)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 5,
        openEditorsCount: 12,
        terminalCount: 3,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });

    it('should strongly reject Monday morning (event should not fire on weekdays)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 1,
      });

      expect(isWeekendTurboSundaysContextRight()).toBe(false);
    });
  });
});
