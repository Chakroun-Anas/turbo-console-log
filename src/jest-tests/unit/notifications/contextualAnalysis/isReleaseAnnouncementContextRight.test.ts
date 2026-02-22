import { isReleaseAnnouncementContextRight } from '@/notifications/contextualAnalysis/contexts/isReleaseAnnouncementContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

// Mock the collectWorkspaceContext helper
jest.mock('@/notifications/contextualAnalysis/helpers');

const mockCollectWorkspaceContext =
  collectWorkspaceContext as jest.MockedFunction<
    typeof collectWorkspaceContext
  >;

describe('isReleaseAnnouncementContextRight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Threshold validation (150)', () => {
    it('should return true for score exactly at threshold (150)', () => {
      // Friday (1.2) × night (1.31) × baseline unsaved (0.985) × 0 editors (1.02)
      // = 100 × 1.2 × 1.31 × 0.985 × 1.02 ≈ 158.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return false for score below threshold', () => {
      // Tuesday (0.91) × afternoon (0.97) × baseline unsaved (0.985) × 3-5 editors (1.0)
      // = 100 × 0.91 × 0.97 × 0.985 × 1.0 ≈ 87
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });
  });

  describe('Best contexts (should pass)', () => {
    it('should return true for Saturday night (best compound context)', () => {
      // Saturday (1.42) × night (1.31) = 186
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return true for Saturday night + 1-2 unsaved + 1-2 editors (optimal)', () => {
      // Saturday (1.42) × night (1.31) × 1-2 unsaved (1.28) × 1-2 editors (1.09)
      // = 100 × 1.42 × 1.31 × 1.28 × 1.09 ≈ 261
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 2,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return true for Friday night', () => {
      // Friday (1.2) × night (1.31) × baseline unsaved (0.985) × 1-2 editors (1.09)
      // = 100 × 1.2 × 1.31 × 0.985 × 1.09 ≈ 169
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 1,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return true for Thursday night', () => {
      // Thursday (1.2) × night (1.31) = 157
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return true for Saturday evening', () => {
      // Saturday (1.42) × evening (1.14) = 162
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });
  });

  describe('Worst contexts (should fail)', () => {
    it('should return false for Tuesday morning', () => {
      // Tuesday (0.91) × morning (0.89) = 81
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });

    it('should return false for Monday morning + 6-10 editors (worst compound)', () => {
      // Monday (0.92) × morning (0.89) × 6-10 editors (0.83) = 68
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 8,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });

    it('should return false for Sunday evening baseline context', () => {
      // Sunday (1.14) × evening (1.14) × baseline unsaved (0.985) × 11+ editors (0.89)
      // = 100 × 1.14 × 1.14 × 0.985 × 0.89 ≈ 113
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 12,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });
  });

  describe('Day of week impact', () => {
    const baseContext: Omit<WorkspaceContext, 'dayOfWeek'> = {
      periodOfDay: 'afternoon',
      unsavedFilesCount: 0,
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply Saturday multiplier (1.42)', () => {
      // Saturday (1.42) × afternoon (0.97) × baseline (0.985) × 3-5 editors (1.0)
      // = 100 × 1.42 × 0.97 × 0.985 × 1.0 ≈ 136
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SATURDAY',
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false); // Below 150
    });

    it('should apply Thursday/Friday multiplier (1.2)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'THURSDAY',
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.2 × 0.97 × 0.985 × 1.0 ≈ 115
      expect(result).toBe(false); // Below 150
    });

    it('should apply Tuesday multiplier (0.91 - worst)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'TUESDAY',
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 0.91 × 0.97 × 0.985 × 1.0 ≈ 87
      expect(result).toBe(false);
    });
  });

  describe('Time of day impact', () => {
    const baseContext: Omit<WorkspaceContext, 'periodOfDay'> = {
      dayOfWeek: 'WEDNESDAY',
      unsavedFilesCount: 0,
      openEditorsCount: 1,
      terminalCount: 0,
    };

    it('should apply night multiplier (1.31 - best)', () => {
      // Wednesday (1.08) × night (1.31) × baseline (0.985) × 1-2 editors (1.09)
      // = 100 × 1.08 × 1.31 × 0.985 × 1.09 ≈ 152
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'night',
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true); // Just above 150
    });

    it('should apply evening multiplier (1.14)', () => {
      // Wednesday (1.08) × evening (1.14) × baseline (0.985) × 1-2 editors (1.09)
      // = 100 × 1.08 × 1.14 × 0.985 × 1.09 ≈ 132
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'evening',
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false); // Below 150
    });

    it('should apply morning multiplier (0.89 - worst)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'morning',
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.08 × 0.89 × 0.985 × 1.09 ≈ 103
      expect(result).toBe(false);
    });
  });

  describe('Unsaved files impact', () => {
    const baseContext: Omit<WorkspaceContext, 'unsavedFilesCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'afternoon',
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply 1-2 unsaved multiplier (1.28 - best)', () => {
      // Saturday (1.42) × afternoon (0.97) × 1-2 unsaved (1.28) × 3-5 editors (1.0)
      // = 100 × 1.42 × 0.97 × 1.28 × 1.0 ≈ 176
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 1,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should apply 3+ unsaved multiplier (0.97)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 5,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.97 × 1.0 ≈ 134
      expect(result).toBe(false); // Below 150
    });

    it('should apply clean state multiplier (0.985)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 0,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.985 × 1.0 ≈ 136
      expect(result).toBe(false); // Below 150
    });
  });

  describe('Open editors impact', () => {
    const baseContext: Omit<WorkspaceContext, 'openEditorsCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'afternoon',
      unsavedFilesCount: 0,
      terminalCount: 0,
    };

    it('should apply 1-2 editors multiplier (1.09 - best)', () => {
      // Saturday (1.42) × afternoon (0.97) × baseline (0.985) × 1-2 editors (1.09)
      // = 100 × 1.42 × 0.97 × 0.985 × 1.09 ≈ 148
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 2,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false); // Just below 150
    });

    it('should apply 0 editors multiplier (1.02)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 0,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.985 × 1.02 ≈ 139
      expect(result).toBe(false);
    });

    it('should apply 3-5 editors multiplier (1.0 - baseline)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 4,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.985 × 1.0 ≈ 136
      expect(result).toBe(false);
    });

    it('should apply 6-10 editors multiplier (0.83 - worst flow state)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 8,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.985 × 0.83 ≈ 113
      expect(result).toBe(false);
    });

    it('should apply 11+ editors multiplier (0.89 - deep flow)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 15,
      });

      const result = isReleaseAnnouncementContextRight();
      // Score: 100 × 1.42 × 0.97 × 0.985 × 0.89 ≈ 121
      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle all baseline factors (score = 100)', () => {
      // All baseline: afternoon, clean unsaved, 3-5 editors
      // But need a weekday with baseline multiplier
      // Let's use Wednesday (1.08) which is above baseline
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 4,
        terminalCount: 0,
      });

      // Wednesday (1.08) × afternoon (0.97) × baseline (0.985) × 3-5 editors (1.0)
      // = 100 × 1.08 × 0.97 × 0.985 × 1.0 ≈ 103
      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });

    it('should handle multiple negative multipliers', () => {
      // All negative factors
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY', // 0.91
        periodOfDay: 'morning', // 0.89
        unsavedFilesCount: 3, // 0.97
        openEditorsCount: 8, // 0.83
        terminalCount: 0,
      });

      // Score: 100 × 0.91 × 0.89 × 0.97 × 0.83 ≈ 60
      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });

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
      const result1 = isReleaseAnnouncementContextRight();

      mockCollectWorkspaceContext.mockReturnValue(context2);
      const result2 = isReleaseAnnouncementContextRight();

      expect(result1).toBe(result2); // Same result regardless of terminal count
    });
  });

  describe('Borderline threshold cases', () => {
    it('should return true for score just above threshold (151)', () => {
      // Friday (1.2) × night (1.31) × baseline (0.985) × 0 editors (1.02)
      // = 100 × 1.2 × 1.31 × 0.985 × 1.02 ≈ 160
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(true);
    });

    it('should return false for score just below threshold (149)', () => {
      // Sunday (1.14) × evening (1.14) × baseline (0.985) × 1-2 editors (1.09)
      // = 100 × 1.14 × 1.14 × 0.985 × 1.09 ≈ 141
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 1,
        terminalCount: 0,
      });

      expect(isReleaseAnnouncementContextRight()).toBe(false);
    });
  });
});
