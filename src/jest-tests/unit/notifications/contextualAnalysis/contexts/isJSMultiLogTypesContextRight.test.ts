import { isJSMultiLogTypesContextRight } from '@/notifications/contextualAnalysis/contexts/isJSMultiLogTypesContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

jest.mock('@/notifications/contextualAnalysis/helpers');

describe('isJSMultiLogTypesContextRight', () => {
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
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) = 270 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return false when score < 150', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.86) × morning (0.95) × 3-5 editors (0.93) × 1 terminal (0.85) = 65 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return true at borderline threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 2,
      });
      // Saturday (1.33) × evening (0.96) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 167 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('best contexts (active cleanup in messy context)', () => {
    it('should return true for Saturday night maximum messy (peak engagement)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 5,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 327 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Friday night with multiple terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 7,
        unsavedFilesCount: 2,
        terminalCount: 4,
      });
      // Friday (1.17) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 287 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Sunday night active refactoring', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 9,
        unsavedFilesCount: 1,
        terminalCount: 5,
      });
      // Sunday (1.09) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 268 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Saturday night with terminals and unsaved', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 2,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 315 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Friday night cleanup session', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Friday (1.17) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) = 228 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Saturday night with many terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 6,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) = 252 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should return true for Sunday afternoon active cleanup', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 8,
        unsavedFilesCount: 2,
        terminalCount: 5,
      });
      // Sunday (1.09) × afternoon (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 199 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('worst contexts (organized/calm)', () => {
    it('should return false for Monday morning organized work', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.86) × morning (0.95) × 3-5 editors (0.93) × 1 terminal (0.85) = 65 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return false for Tuesday morning single terminal', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'morning',
        openEditorsCount: 5,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Tuesday (0.93) × morning (0.95) × 3-5 editors (0.93) × 1 terminal (0.85) = 70 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return false for Monday afternoon calm browsing', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 3,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Monday (0.86) × afternoon (0.95) × 3-5 editors (0.93) × 0 terminals (0.97) = 74 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return false for Thursday morning no terminals', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Thursday (0.95) × morning (0.95) × 1-2 editors (1.03) × 0 terminals (0.97) = 90 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return false for Tuesday afternoon single file', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Tuesday (0.93) × afternoon (0.95) × 1-2 editors (1.03) × 1 terminal (0.85) = 77 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should return false for Monday evening reading code', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Monday (0.86) × evening (0.96) × 1-2 editors (1.03) × 0 terminals (0.97) = 83 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });
  });

  describe('day of week impact', () => {
    it('should apply Saturday multiplier (1.33)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 219 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply Friday multiplier (1.17)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Friday (1.17) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 277 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply Sunday multiplier (1.09)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 7,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Sunday (1.09) × night (1.28) × 6-10 editors (1.07) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 189 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply Wednesday neutral (1.01)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Wednesday (1.01) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 248 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply Thursday penalty (0.95)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Thursday (0.95) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) = 130 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should apply Tuesday penalty (0.93)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Tuesday (0.93) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 153 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply Monday penalty (0.86)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Monday (0.86) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 211 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('time of day impact', () => {
    it('should apply night multiplier (1.28)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 219 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply evening penalty (0.96)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.33) × evening (0.96) × 6-10 editors (1.07) × 4+ terminals (1.48) = 202 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply morning penalty (0.95)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 7,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.33) × morning (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 242 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply afternoon penalty (0.95)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.33) × afternoon (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 242 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('terminal count impact (STRONGEST signal)', () => {
    it('should apply 4+ terminals boost (1.48) - strongest multiplier', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 5,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) = 260 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 2-3 terminals boost (1.04)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 3,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 219 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 0 terminals penalty (0.97)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 0,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 0 terminals (0.97) × 1+ unsaved (1.21) = 214 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 1 terminal penalty (0.85)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 1,
        terminalCount: 1,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 1 terminal (0.85) × 1+ unsaved (1.21) = 188 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('open editors impact (messy = receptive)', () => {
    it('should apply 6-10 editors boost (1.07) - messy context', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) = 270 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 1-2 editors boost (1.03)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) = 260 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 0 editors neutral (1.0)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 0,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 0 editors (1.0) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 305 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 11+ editors penalty (0.97)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 15,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 11+ editors (0.97) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 297 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should apply 3-5 editors penalty (0.93)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 4,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 3-5 editors (0.93) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 283 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('unsaved files impact', () => {
    it('should apply 1+ unsaved files boost (1.21) - active cleanup mode', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 2,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 315 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should not apply boost for 0 unsaved files', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 4,
      });
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) = 260 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
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
      // Monday (0.86) × morning (0.95) × 3-5 editors (0.93) × 1 terminal (0.85) = 65 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should handle baseline context (neutral)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 0,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Wednesday (1.01) × afternoon (0.95) × 0 editors (1.0) × 2-3 terminals (1.04) = 100 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should handle single strong multiplier (not enough)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'morning',
        openEditorsCount: 4,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Saturday (1.33) × morning (0.95) × 3-5 editors (0.93) × 1 terminal (0.85) = 100 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });
  });

  describe('borderline threshold cases', () => {
    it('should pass just above threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Friday (1.17) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) = 161 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should fail just below threshold', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 3,
      });
      // Friday (1.17) × evening (0.96) × 1-2 editors (1.03) × 2-3 terminals (1.04) = 121 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should pass with three moderate multipliers', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        openEditorsCount: 7,
        unsavedFilesCount: 0,
        terminalCount: 2,
      });
      // Sunday (1.09) × night (1.28) × 6-10 editors (1.07) × 2-3 terminals (1.04) = 155 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should pass with strong terminal count compensating for day', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'night',
        openEditorsCount: 2,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Thursday (0.95) × night (1.28) × 1-2 editors (1.03) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 223 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should pass for Saturday night active refactoring (peak scenario)', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        openEditorsCount: 8,
        unsavedFilesCount: 2,
        terminalCount: 5,
      });
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 327 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should fail for Monday morning organized feature work', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'morning',
        openEditorsCount: 2,
        unsavedFilesCount: 0,
        terminalCount: 1,
      });
      // Monday (0.86) × morning (0.95) × 1-2 editors (1.03) × 1 terminal (0.85) = 72 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should pass for Friday evening cleanup before weekend', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        openEditorsCount: 7,
        unsavedFilesCount: 1,
        terminalCount: 4,
      });
      // Friday (1.17) × evening (0.96) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 215 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should fail for Tuesday afternoon casual browsing', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Tuesday (0.93) × afternoon (0.95) × 1-2 editors (1.03) × 0 terminals (0.97) = 88 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should pass for Sunday afternoon dedicated refactor', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'afternoon',
        openEditorsCount: 9,
        unsavedFilesCount: 1,
        terminalCount: 5,
      });
      // Sunday (1.09) × afternoon (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) × 1+ unsaved (1.21) = 199 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should fail for Thursday morning single file review', () => {
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'morning',
        openEditorsCount: 1,
        unsavedFilesCount: 0,
        terminalCount: 0,
      });
      // Thursday (0.95) × morning (0.95) × 1-2 editors (1.03) × 0 terminals (0.97) = 90 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });
  });

  describe('messy vs calm pattern validation', () => {
    it('should prefer messy (6-10 editors + 4+ terminals) over calm (1-2 editors + 1 terminal)', () => {
      const messyContext = {
        dayOfWeek: 'SATURDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 5,
      };
      mockCollectWorkspaceContext.mockReturnValue(messyContext);
      // Saturday (1.33) × night (1.28) × 6-10 editors (1.07) × 4+ terminals (1.48) = 270 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);

      const calmContext = {
        ...messyContext,
        openEditorsCount: 2,
        terminalCount: 1,
      };
      mockCollectWorkspaceContext.mockReturnValue(calmContext);
      // Saturday (1.33) × night (1.28) × 1-2 editors (1.03) × 1 terminal (0.85) = 149 ❌ (borderline)
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });

    it('should prefer active cleanup (unsaved files) over passive browsing', () => {
      const activeContext = {
        dayOfWeek: 'FRIDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'night' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 2,
        unsavedFilesCount: 2,
        terminalCount: 3,
      };
      mockCollectWorkspaceContext.mockReturnValue(activeContext);
      // Friday (1.17) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) × 1+ unsaved (1.21) = 195 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);

      const passiveContext = { ...activeContext, unsavedFilesCount: 0 };
      mockCollectWorkspaceContext.mockReturnValue(passiveContext);
      // Friday (1.17) × night (1.28) × 1-2 editors (1.03) × 2-3 terminals (1.04) = 161 ✅ (still passes but lower)
      expect(isJSMultiLogTypesContextRight()).toBe(true);
    });

    it('should prefer weekend refactoring over weekday feature work', () => {
      const weekendContext = {
        dayOfWeek: 'SATURDAY' as WorkspaceContext['dayOfWeek'],
        periodOfDay: 'afternoon' as WorkspaceContext['periodOfDay'],
        openEditorsCount: 8,
        unsavedFilesCount: 0,
        terminalCount: 4,
      };
      mockCollectWorkspaceContext.mockReturnValue(weekendContext);
      // Saturday (1.33) × afternoon (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) = 202 ✅
      expect(isJSMultiLogTypesContextRight()).toBe(true);

      const weekdayContext = {
        ...weekendContext,
        dayOfWeek: 'MONDAY' as WorkspaceContext['dayOfWeek'],
      };
      mockCollectWorkspaceContext.mockReturnValue(weekdayContext);
      // Monday (0.86) × afternoon (0.95) × 6-10 editors (1.07) × 4+ terminals (1.48) = 130 ❌
      expect(isJSMultiLogTypesContextRight()).toBe(false);
    });
  });
});
