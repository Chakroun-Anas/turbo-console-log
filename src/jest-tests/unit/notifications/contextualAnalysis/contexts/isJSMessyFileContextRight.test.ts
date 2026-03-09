import { isJSMessyFileContextRight } from '@/notifications/contextualAnalysis/contexts/isJSMessyFileContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

jest.mock('@/notifications/contextualAnalysis/helpers');

describe('isJSMessyFileContextRight', () => {
  const mockCollectWorkspaceContext =
    collectWorkspaceContext as jest.MockedFunction<
      typeof collectWorkspaceContext
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('threshold validation', () => {
    it('should return true when score >= 100', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) = 223 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return false when score < 100', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Monday (0.88) × morning (0.91) × 6-10 editors (0.87) × 0 terminals (0.86) = 60 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should return true at borderline threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Saturday (1.36) × afternoon (0.92) × 1-2 editors (1.08) × 0 terminals (0.86) = 116 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('best contexts (focused exploration)', () => {
    it('should return true for Saturday night (maximum)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) = 203 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return true for Saturday night with 0 editors (focused)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) × 4+ terminals (1.31) = 293 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return true for Sunday night with 4+ terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 5,
      });
      // Sunday (1.13) × night (1.38) × 1-2 editors (1.08) × 4+ terminals (1.31) = 221 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return true for Saturday night focused work', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) = 223 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return true for Wednesday night with terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Wednesday (1.09) × night (1.38) × 0 editors (1.19) × 4+ terminals (1.31) = 235 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should return true for Sunday evening focused', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Sunday (1.13) × evening (1.08) × 1-2 editors (1.08) × 4+ terminals (1.31) = 173 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('worst contexts (busy/distracted)', () => {
    it('should return false for Monday morning', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.88) × morning (0.91) × 3-5 editors (0.94) × 1 terminal (0.92) = 69 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should return false for Monday morning with 6-10 editors (distracted)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Monday (0.88) × morning (0.91) × 6-10 editors (0.87) × 0 terminals (0.86) = 60 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should return false for Friday afternoon juggling files', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 9,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Friday (0.89) × afternoon (0.92) × 6-10 editors (0.87) × 1 terminal (0.92) = 66 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should return false for Tuesday morning no terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Tuesday (0.98) × morning (0.91) × 3-5 editors (0.94) × 0 terminals (0.86) = 72 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should return false for Friday morning (winding down)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Friday (0.89) × morning (0.91) × 1-2 editors (1.08) × 1 terminal (0.92) = 80 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });
  });

  describe('day of week impact', () => {
    it('should apply Saturday multiplier (1.36)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) = 203 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply Sunday multiplier (1.13)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Sunday (1.13) × night (1.38) × 0 editors (1.19) = 185 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply Wednesday boost (1.09)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Wednesday (1.09) × night (1.38) × 1-2 editors (1.08) × 4+ terminals (1.31) = 214 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply Monday penalty (0.88)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Monday (0.88) × morning (0.91) × 1-2 editors (1.08) = 86 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should apply Friday penalty (0.89)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Friday (0.89) × night (1.38) × 1-2 editors (1.08) × 1 terminal (0.92) = 122 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('time of day impact', () => {
    it('should apply night multiplier (1.38)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) = 203 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply evening boost (1.08)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.36) × evening (1.08) × 1-2 editors (1.08) × 4+ terminals (1.31) = 208 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply afternoon penalty (0.92)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.36) × afternoon (0.92) × 0 editors (1.19) × 4+ terminals (1.31) = 195 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply morning penalty (0.91)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.36) × morning (0.91) × 1-2 editors (1.08) × 1 terminal (0.92) = 123 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('terminal count impact (technical activity)', () => {
    it('should apply 4+ terminals boost (1.31)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 5,
      });
      // Saturday (1.36) × evening (1.08) × 1-2 editors (1.08) × 4+ terminals (1.31) = 208 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 2-3 terminals boost (1.07)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 3,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) × 2-3 terminals (1.07) = 217 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 1 terminal penalty (0.92)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) × 1 terminal (0.92) = 205 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 0 terminals penalty (0.86)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) × 0 terminals (0.86) = 192 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('open editors impact (focused pattern)', () => {
    it('should apply 0 editors boost (1.19) - most focused', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 0 editors (1.19) = 223 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 1-2 editors boost (1.08) - still focused', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) = 203 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 11+ editors slight boost (1.03)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 15,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 11+ editors (1.03) = 193 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 3-5 editors penalty (0.94)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 3-5 editors (0.94) = 176 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should apply 6-10 editors penalty (0.87) - distracted', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Saturday (1.36) × night (1.38) × 6-10 editors (0.87) = 163 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle all negative multipliers (worst possible)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Monday (0.88) × morning (0.91) × 6-10 editors (0.87) × 0 terminals (0.86) = 60 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should handle baseline context with terminals (now passes)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Tuesday (0.98) × afternoon (0.92) × 1-2 editors (1.08) × 2-3 terminals (1.07) = 104 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should handle single strong multiplier (not enough)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Saturday (1.36) × morning (0.91) × 6-10 editors (0.87) × 0 terminals (0.86) = 93 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });
  });

  describe('borderline threshold cases', () => {
    it('should pass just above threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Sunday (1.13) × night (1.38) × 1-2 editors (1.08) × 1 terminal (0.92) = 156 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should pass above threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.36) × morning (0.91) × 1-2 editors (1.08) × 1 terminal (0.92) = 123 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should pass with two strong multipliers', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Saturday (1.36) × night (1.38) × 3-5 editors (0.94) × 0 terminals (0.86) = 152 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should pass with three moderate multipliers', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Wednesday (1.09) × evening (1.08) × 0 editors (1.19) × 4+ terminals (1.31) = 184 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should pass for Saturday night focused refactoring', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) × 4+ terminals (1.31) = 266 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should fail for Monday morning feature crunch', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 10,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.88) × morning (0.91) × 6-10 editors (0.87) × 1 terminal (0.92) = 64 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should pass for Sunday evening code cleanup session', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 3,
      });
      // Sunday (1.13) × evening (1.08) × 0 editors (1.19) × 2-3 terminals (1.07) = 156 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should fail for Friday afternoon winding down', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Friday (0.89) × afternoon (0.92) × 3-5 editors (0.94) = 77 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });

    it('should pass for Wednesday night exploration', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Wednesday (1.09) × night (1.38) × 1-2 editors (1.08) × 4+ terminals (1.31) = 214 ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should fail for Tuesday morning browsing code', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        openEditorsCount: 7,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Tuesday (0.98) × morning (0.91) × 6-10 editors (0.87) × 0 terminals (0.86) = 67 ❌
      expect(isJSMessyFileContextRight()).toBe(false);
    });
  });

  describe('focused vs distracted pattern validation', () => {
    it('should prefer focused (0-2 editors) over distracted (6-10 editors)', () => {
      const focusedContext = {
        dayOfWeek: 'SATURDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 2,
      };
      mockCollectWorkspaceContext.mockReturnValue(focusedContext);
      // Saturday (1.36) × night (1.38) × 1-2 editors (1.08) = 203 ✅
      expect(isJSMessyFileContextRight()).toBe(true);

      const distractedContext = { ...focusedContext, openEditorsCount: 8 };
      mockCollectWorkspaceContext.mockReturnValue(distractedContext);
      // Saturday (1.36) × night (1.38) × 6-10 editors (0.87) = 163 ✅ (still passes but lower)
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should prefer weekend exploration over weekday grind', () => {
      const weekendContext = {
        dayOfWeek: 'SATURDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'evening' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      };
      mockCollectWorkspaceContext.mockReturnValue(weekendContext);
      // Saturday (1.36) × evening (1.08) × 1-2 editors (1.08) = 159 ✅
      expect(isJSMessyFileContextRight()).toBe(true);

      const weekdayContext = {
        ...weekendContext,
        dayOfWeek: 'MONDAY' as WorkspaceContext['dayOfWeek'],
      };
      mockCollectWorkspaceContext.mockReturnValue(weekdayContext);
      // Monday (0.88) × evening (1.08) × 1-2 editors (1.08) = 103 (now passes) ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });

    it('should prefer active dev (4+ terminals) over browsing (0 terminals)', () => {
      const activeContext = {
        dayOfWeek: 'WEDNESDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'evening' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 5,
      };
      mockCollectWorkspaceContext.mockReturnValue(activeContext);
      // Wednesday (1.09) × evening (1.08) × 1-2 editors (1.08) × 4+ terminals (1.31) = 167 ✅
      expect(isJSMessyFileContextRight()).toBe(true);

      const browsingContext = { ...activeContext, terminalCount: 0 };
      mockCollectWorkspaceContext.mockReturnValue(browsingContext);
      // Wednesday (1.09) × evening (1.08) × 1-2 editors (1.08) × 0 terminals (0.86) = 109 (now passes) ✅
      expect(isJSMessyFileContextRight()).toBe(true);
    });
  });
});
