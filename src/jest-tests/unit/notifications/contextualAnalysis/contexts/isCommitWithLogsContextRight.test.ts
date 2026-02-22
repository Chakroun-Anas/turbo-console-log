import { isCommitWithLogsContextRight } from '@/notifications/contextualAnalysis/contexts/isCommitWithLogsContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

jest.mock('@/notifications/contextualAnalysis/helpers');

describe('isCommitWithLogsContextRight', () => {
  const mockCollectWorkspaceContext =
    collectWorkspaceContext as jest.MockedFunction<
      typeof collectWorkspaceContext
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('threshold validation', () => {
    it('should return true when score >= 150', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return false when score < 150', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Monday (0.78) × morning (0.91) = 71 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return true at exact threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Thursday (1.17) × night (1.29) = 151 (just above 150) ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('best contexts (chaos)', () => {
    it('should return true for Saturday night (maximum chaos)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for Saturday night with 4+ terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.48) × night (1.29) × 4+ terminals (1.21) = 231 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for Thursday night with 4+ terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 5,
      });
      // Thursday (1.17) × night (1.29) × 4+ terminals (1.21) = 183 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for Saturday night with 6-10 editors', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 6-10 editors (1.12) = 214 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for Sunday night', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Sunday (1.09) × night (1.29) × 6-10 editors (1.12) × 4+ terminals (1.21) = 190 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for Thursday night (borderline)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Thursday (1.17) × night (1.29) = 151 (just above threshold) ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should return true for maximum chaos context', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 2,
        terminalCount: 5,
      });
      // Saturday (1.48) × night (1.29) × 6-10 editors (1.12) × 4+ terminals (1.21) × 1+ unsaved (1.03) = 266 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('worst contexts (organized)', () => {
    it('should return false for Monday morning', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Monday (0.78) × morning (0.91) = 71 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return false for Monday morning with 1 terminal', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.78) × morning (0.91) × 1 terminal (0.91) = 65 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return false for Wednesday afternoon', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Wednesday (1.0) × afternoon (0.98) × 3-5 editors (0.93) = 91 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return false for Friday morning with 3-5 editors', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'morning',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Friday (1.0) × morning (0.91) × 3-5 editors (0.93) × 1 terminal (0.91) = 77 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return false for Sunday evening (just below threshold)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Sunday (1.09) × evening (0.98) = 107 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should return false for Saturday evening (just below threshold)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × evening (0.98) = 145 (just below 150) ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });
  });

  describe('day of week impact', () => {
    it('should apply Saturday multiplier (1.48)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply Thursday multiplier (1.17)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Thursday (1.17) × night (1.29) = 151 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply Sunday multiplier (1.09)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Sunday (1.09) × night (1.29) × 4+ terminals (1.21) = 170 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply neutral multiplier for Tuesday/Wednesday/Friday', () => {
      ['TUESDAY', 'WEDNESDAY', 'FRIDAY'].forEach((day) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: day as WorkspaceContext['dayOfWeek'],
          periodOfDay: 'night',
          openEditorsCount: 2,
          unsavedFilesCount: 0,
          terminalCount: 4,
        });
        // day (1.0) × night (1.29) × 4+ terminals (1.21) = 156 ✅
        expect(isCommitWithLogsContextRight()).toBe(true);
      });
    });

    it('should apply Monday penalty (0.78)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Monday (0.78) × morning (0.91) = 71 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });
  });

  describe('time of day impact', () => {
    it('should apply night multiplier (1.29)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply slight penalty for evening (0.98)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.48) × evening (0.98) × 4+ terminals (1.21) = 175 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply slight penalty for afternoon (0.98)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.48) × afternoon (0.98) × 4+ terminals (1.21) = 175 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply morning penalty (0.91)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.48) × morning (0.91) × 4+ terminals (1.21) = 163 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('terminal count impact (chaos indicator)', () => {
    it('should apply 4+ terminals boost (1.21)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 5,
      });
      // Thursday (1.17) × night (1.29) × 4+ terminals (1.21) = 183 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply 0 terminals slight boost (1.05)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Saturday (1.48) × night (1.29) × 0 terminals (1.05) = 201 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply neutral for 2-3 terminals (1.0)', () => {
      [2, 3].forEach((count) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: 'SATURDAY',
          periodOfDay: 'night',
          openEditorsCount: 2,
          unsavedFilesCount: 0,
          terminalCount: count,
        });
        // Saturday (1.48) × night (1.29) = 191 ✅
        expect(isCommitWithLogsContextRight()).toBe(true);
      });
    });

    it('should apply 1 terminal penalty (0.91)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.48) × night (1.29) × 1 terminal (0.91) = 174 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('open editors impact', () => {
    it('should apply 6-10 editors boost (1.12)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 6-10 editors (1.12) = 214 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply 0 editors slight boost (1.02)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 0 editors (1.02) = 195 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply neutral for 1-2 editors (1.0)', () => {
      [1, 2].forEach((count) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: 'SATURDAY',
          periodOfDay: 'night',
          openEditorsCount: count,
          unsavedFilesCount: 0,
          terminalCount: 2,
        });
        // Saturday (1.48) × night (1.29) = 191 ✅
        expect(isCommitWithLogsContextRight()).toBe(true);
      });
    });

    it('should apply slight penalty for 11+ editors (0.98)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 15,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 11+ editors (0.98) = 187 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply penalty for 3-5 editors (0.93)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 3-5 editors (0.93) = 178 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('unsaved files impact', () => {
    it('should apply slight boost for 1+ unsaved files (1.03)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 2,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 1+ unsaved (1.03) = 197 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should apply neutral for 0 unsaved files (1.0)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should treat 3+ unsaved same as 1-2 (no extreme multiplier)', () => {
      // 3+ unsaved had only 35 samples (statistically unreliable), so we simplified
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 5,
        terminalCount: 2,
      });
      // Saturday (1.48) × night (1.29) × 1+ unsaved (1.03) = 197 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle all negative multipliers (worst possible)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.78) × morning (0.91) × 3-5 editors (0.93) × 1 terminal (0.91) = 61 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should handle baseline context (all neutral)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Tuesday (1.0) × afternoon (0.98) = 98 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should handle single strong multiplier (not enough)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.48) × afternoon (0.98) × 1 terminal (0.91) = 132 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });
  });

  describe('borderline threshold cases', () => {
    it('should pass just above threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Thursday (1.17) × night (1.29) = 151 (just above 150) ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should fail just below threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.48) × evening (0.98) = 145 (just below 150) ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should pass with two moderate multipliers', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 2,
      });
      // Thursday (1.17) × night (1.29) × 1+ unsaved (1.03) = 155 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should pass with three small multipliers', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Sunday (1.09) × night (1.29) × 6-10 editors (1.12) = 157 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should pass for weekend night hacking session (typical chaos)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 7,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.48) × night (1.29) × 6-10 editors (1.12) × 4+ terminals (1.21) × 1+ unsaved (1.03) = 266 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should fail for Monday morning code review (organized)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 3,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.78) × morning (0.91) × 3-5 editors (0.93) × 1 terminal (0.91) = 61 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should pass for Thursday pre-weekend push (rushing)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 9,
        unsavedFilesCount: 2,
        terminalCount: 5,
      });
      // Thursday (1.17) × night (1.29) × 6-10 editors (1.12) × 4+ terminals (1.21) × 1+ unsaved (1.03) = 224 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should fail for Wednesday midday grind (focused)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Wednesday (1.0) × afternoon (0.98) = 98 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should pass for Sunday evening project exploration', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Sunday (1.09) × night (1.29) × 6-10 editors (1.12) × 1+ unsaved (1.03) = 162 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);
    });

    it('should fail for Friday afternoon winding down', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Friday (1.0) × afternoon (0.98) × 1 terminal (0.91) = 89 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });
  });

  describe('chaos vs organized pattern validation', () => {
    it('should prefer chaos: multiple terminals over single terminal', () => {
      const chaosContext = {
        dayOfWeek: 'THURSDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 5,
      };
      mockCollectWorkspaceContext.mockReturnValue(chaosContext);
      // Thursday (1.17) × night (1.29) × 4+ terminals (1.21) = 183 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);

      const organizedContext = { ...chaosContext, terminalCount: 1 };
      mockCollectWorkspaceContext.mockReturnValue(organizedContext);
      // Thursday (1.17) × night (1.29) × 1 terminal (0.91) = 137 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should prefer chaos: weekend over Monday', () => {
      const chaosContext = {
        dayOfWeek: 'SATURDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      };
      mockCollectWorkspaceContext.mockReturnValue(chaosContext);
      // Saturday (1.48) × night (1.29) = 191 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);

      const organizedContext = {
        ...chaosContext,
        dayOfWeek: 'MONDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'morning' as WorkspaceContext['periodOfDay'],
      };
      mockCollectWorkspaceContext.mockReturnValue(organizedContext);
      // Monday (0.78) × morning (0.91) = 71 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });

    it('should prefer chaos: night coding over morning review', () => {
      const chaosContext = {
        dayOfWeek: 'THURSDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 2,
      };
      mockCollectWorkspaceContext.mockReturnValue(chaosContext);
      // Thursday (1.17) × night (1.29) × 1-2 editors (1.0) × 1+ unsaved (1.03) = 155 ✅
      expect(isCommitWithLogsContextRight()).toBe(true);

      const organizedContext = {
        ...chaosContext,
        periodOfDay: 'morning' as WorkspaceContext['periodOfDay'],
        unsavedFilesCount: 0,
      };
      mockCollectWorkspaceContext.mockReturnValue(organizedContext);
      // Thursday (1.17) × morning (0.91) × 1-2 editors (1.0) = 106 ❌
      expect(isCommitWithLogsContextRight()).toBe(false);
    });
  });
});
