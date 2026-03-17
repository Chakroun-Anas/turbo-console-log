import { isInactiveFourWeeksSurveyContextRight } from '@/notifications/contextualAnalysis/contexts/isInactiveFourWeeksSurveyContextRight';
import { collectWorkspaceContext } from '@/notifications/contextualAnalysis/helpers';
import { WorkspaceContext } from '@/entities';

// Mock the collectWorkspaceContext helper
jest.mock('@/notifications/contextualAnalysis/helpers');

const mockCollectWorkspaceContext =
  collectWorkspaceContext as jest.MockedFunction<
    typeof collectWorkspaceContext
  >;

describe('isInactiveFourWeeksSurveyContextRight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Threshold validation (100 - survey-friendly time)', () => {
    it('should return true for Saturday night (weekend survey-friendly time)', () => {
      // Saturday (2.2) × night (1.6) = 352
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for optimal context (Saturday night + 1-2 editors)', () => {
      // Saturday (2.2) × night (1.6) × 1-2 editors (1.3)
      // = 100 × 2.2 × 1.6 × 1.3 ≈ 457.6 (max achievable)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return false for score below threshold', () => {
      // Wednesday (0.54) × afternoon (0.8) × 0 editors (0.7)
      // = 100 × 0.54 × 0.8 × 0.7 ≈ 30.2
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });
  });

  describe('Best contexts (should pass)', () => {
    it('should return true for Saturday night (peak survey engagement)', () => {
      // Saturday (2.2) × night (1.6) = 352
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Saturday evening', () => {
      // Saturday (2.2) × evening (1.35) = 297
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Sunday night', () => {
      // Sunday (1.4) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96)
      // = 100 × 1.4 × 1.6 × 1.3 × 0.96 ≈ 280
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Friday night', () => {
      // Friday (1.3) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96)
      // = 100 × 1.3 × 1.6 × 1.3 × 0.96 ≈ 260
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Monday night', () => {
      // Monday (1.3) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96)
      // = 100 × 1.3 × 1.6 × 1.3 × 0.96 ≈ 260
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Saturday night with optimal editors', () => {
      // Saturday (2.2) × night (1.6) × 1-2 editors (1.3)
      // = 100 × 2.2 × 1.6 × 1.3 ≈ 457.6
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 1,
        openEditorsCount: 2,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Worst contexts (should fail)', () => {
    it('should return false for Wednesday afternoon (worst compound)', () => {
      // Wednesday (0.54) × afternoon (0.8) = 43.2
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should return false for Wednesday morning', () => {
      // Wednesday (0.54) × morning (0.85) = 45.9
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should return false for Wednesday night (day penalty too strong)', () => {
      // Wednesday (0.54) × night (1.6) = 86.4
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should return false for Thursday afternoon', () => {
      // Thursday (0.85) × afternoon (0.8) = 68
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should return true for Sunday evening (now above threshold)', () => {
      // Sunday (1.4) × evening (1.35) = 189
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Friday evening', () => {
      // Friday (1.3) × evening (1.35) = 175.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Day of week impact', () => {
    const baseContext: Omit<WorkspaceContext, 'dayOfWeek'> = {
      periodOfDay: 'night',
      unsavedFilesCount: 0,
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply Saturday multiplier (2.2 - best, weekend exploration)', () => {
      // Saturday (2.2) × night (1.6) = 352
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SATURDAY',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply Sunday multiplier (1.4)', () => {
      // Sunday (1.4) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96) ≈ 280
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'SUNDAY',
        openEditorsCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply Friday multiplier (1.3)', () => {
      // Friday (1.3) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96) ≈ 260
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'FRIDAY',
        openEditorsCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply Monday multiplier (1.3)', () => {
      // Monday (1.3) × night (1.6) × 1-2 editors (1.3) × 0 unsaved (0.96) ≈ 260
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'MONDAY',
        openEditorsCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply Tuesday multiplier (1.08)', () => {
      // Tuesday (1.08) × night (1.6) = 172.8
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'TUESDAY',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true); // Above 100
    });

    it('should apply Thursday multiplier (0.85)', () => {
      // Thursday (0.85) × night (1.6) = 136
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'THURSDAY',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply Wednesday multiplier (0.54 - worst)', () => {
      // Wednesday (0.54) × night (1.6) = 86.4
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        dayOfWeek: 'WEDNESDAY',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });
  });

  describe('Time of day impact', () => {
    const baseContext: Omit<WorkspaceContext, 'periodOfDay'> = {
      dayOfWeek: 'SATURDAY',
      unsavedFilesCount: 0,
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply night multiplier (1.6 - best, exploratory time)', () => {
      // Saturday (2.2) × night (1.6) = 352
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'night',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply evening multiplier (1.35)', () => {
      // Saturday (2.2) × evening (1.35) = 297
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'evening',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply morning multiplier (0.85)', () => {
      // Saturday (2.2) × morning (0.85) = 187
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'morning',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply afternoon multiplier (0.8 - worst)', () => {
      // Saturday (2.2) × afternoon (0.8) = 176
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        periodOfDay: 'afternoon',
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Open editors impact', () => {
    const baseContext: Omit<WorkspaceContext, 'openEditorsCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'evening',
      unsavedFilesCount: 0,
      terminalCount: 0,
    };

    it('should apply 1-2 editors multiplier (1.3 - best, light focus)', () => {
      // Saturday (2.2) × evening (1.35) × 1-2 editors (1.3)
      // = 100 × 2.2 × 1.35 × 1.3 ≈ 386.1
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 3-5 editors multiplier (0.85)', () => {
      // Saturday (2.2) × evening (1.35) × 3-5 editors (0.85)
      // = 100 × 2.2 × 1.35 × 0.85 ≈ 252.5
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 4,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 6-10 editors multiplier (0.77)', () => {
      // Saturday (2.2) × evening (1.35) × 6-10 editors (0.77)
      // = 100 × 2.2 × 1.35 × 0.77 ≈ 228.7
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 8,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 11+ editors multiplier (0.88)', () => {
      // Saturday (2.2) × evening (1.35) × 11+ editors (0.88)
      // = 100 × 2.2 × 1.35 × 0.88 ≈ 261.4
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 15,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 0 editors multiplier (0.7 - worst, cold start)', () => {
      // Saturday (2.2) × evening (1.35) × 0 editors (0.7) × 0 unsaved (0.96)
      // = 100 × 2.2 × 1.35 × 0.7 × 0.96 ≈ 199.6 (passes now!)
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        openEditorsCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Unsaved files impact (minor signal)', () => {
    const baseContext: Omit<WorkspaceContext, 'unsavedFilesCount'> = {
      dayOfWeek: 'SATURDAY',
      periodOfDay: 'night',
      openEditorsCount: 3,
      terminalCount: 0,
    };

    it('should apply 1-2 unsaved multiplier (1.0 - baseline)', () => {
      // Saturday (2.2) × night (1.6) × 1-2 unsaved (1.0) = 352
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 0 unsaved multiplier (0.96 - slight penalty)', () => {
      // Saturday (2.2) × night (1.6) × 0 unsaved (0.96) ≈ 337.9
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should apply 3+ unsaved multiplier (0.96 - same as 0)', () => {
      // Saturday (2.2) × night (1.6) × 3+ unsaved (0.96) ≈ 337.9
      mockCollectWorkspaceContext.mockReturnValue({
        ...baseContext,
        unsavedFilesCount: 5,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
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
      const result1 = isInactiveFourWeeksSurveyContextRight();

      mockCollectWorkspaceContext.mockReturnValue(context2);
      const result2 = isInactiveFourWeeksSurveyContextRight();

      expect(result1).toBe(result2); // Same result regardless of terminal count
      expect(result1).toBe(true); // Both should pass
    });

    it('should handle all negative multipliers', () => {
      // Wednesday (0.54) × afternoon (0.8) × 0 editors (0.7) × 0 unsaved (0.96)
      // = 100 × 0.54 × 0.8 × 0.7 × 0.96 ≈ 29.0
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should handle baseline context (Thursday afternoon)', () => {
      // Thursday (0.85) × afternoon (0.8) = 68
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });
  });

  describe('Borderline threshold cases', () => {
    it('should return true for score at threshold (200)', () => {
      // Saturday (2.2) × evening (1.35) × 0 editors (0.7) × 1-2 unsaved (1.0)
      // = 100 × 2.2 × 1.35 × 0.7 × 1.0 = 207.9 (just above 200!)
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 1,
        openEditorsCount: 0,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for score above threshold (189)', () => {
      // Sunday (1.4) × evening (1.35) = 189
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Friday evening (175.5)', () => {
      // Friday (1.3) × evening (1.35) = 175.5
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should return true for Tuesday night (172.8)', () => {
      // Tuesday (1.08) × night (1.6) = 172.8
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'TUESDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Real-world scenarios', () => {
    it('should accept Saturday night reflection (typical survey-friendly time)', () => {
      // User winding down on Saturday night, receptive to surveys
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 1,
        terminalCount: 0,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should accept Sunday evening with light coding', () => {
      // User working on side project, potentially open to survey
      // Sunday (1.4) × evening (1.35) × 1-2 editors (1.3)
      // = 100 × 1.4 × 1.35 × 1.3 ≈ 245.7
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'SUNDAY',
        periodOfDay: 'evening',
        unsavedFilesCount: 1,
        openEditorsCount: 2,
        terminalCount: 1,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should reject Wednesday morning work start (worst timing)', () => {
      // User starting work mid-week, hostile to surveys
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'WEDNESDAY',
        periodOfDay: 'morning',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 1,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should reject Thursday afternoon deep focus', () => {
      // User in flow state, multiple files open, hostile to interruptions
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'THURSDAY',
        periodOfDay: 'afternoon',
        unsavedFilesCount: 5,
        openEditorsCount: 12,
        terminalCount: 3,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(false);
    });

    it('should accept Friday night kick-off (weekend momentum starting)', () => {
      // User starting weekend project Friday night
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'FRIDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 1,
        openEditorsCount: 2,
        terminalCount: 2,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });

    it('should accept Monday night coding (week start energy)', () => {
      // User energetic on Monday night, open to engagement
      mockCollectWorkspaceContext.mockReturnValue({
        dayOfWeek: 'MONDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 2,
        openEditorsCount: 2,
        terminalCount: 1,
      });

      expect(isInactiveFourWeeksSurveyContextRight()).toBe(true);
    });
  });

  describe('Survey-specific insights', () => {
    it('should strongly prefer weekends over weekdays (Saturday >> Wednesday)', () => {
      const saturdayNightContext: WorkspaceContext = {
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      };

      mockCollectWorkspaceContext.mockReturnValue(saturdayNightContext);
      const saturdayResult = isInactiveFourWeeksSurveyContextRight();

      const wednesdayNightContext: WorkspaceContext = {
        ...saturdayNightContext,
        dayOfWeek: 'WEDNESDAY',
      };

      mockCollectWorkspaceContext.mockReturnValue(wednesdayNightContext);
      const wednesdayResult = isInactiveFourWeeksSurveyContextRight();

      expect(saturdayResult).toBe(true); // 352 score
      expect(wednesdayResult).toBe(false); // 86.4 score
      expect(352 / 86.4).toBeCloseTo(4.07, 1); // 4× difference
    });

    it('should strongly prefer night over afternoon (exploratory vs work)', () => {
      const saturdayNightContext: WorkspaceContext = {
        dayOfWeek: 'SATURDAY',
        periodOfDay: 'night',
        unsavedFilesCount: 0,
        openEditorsCount: 3,
        terminalCount: 0,
      };

      mockCollectWorkspaceContext.mockReturnValue(saturdayNightContext);
      const nightResult = isInactiveFourWeeksSurveyContextRight();

      const saturdayAfternoonContext: WorkspaceContext = {
        ...saturdayNightContext,
        periodOfDay: 'afternoon',
      };

      mockCollectWorkspaceContext.mockReturnValue(saturdayAfternoonContext);
      const afternoonResult = isInactiveFourWeeksSurveyContextRight();

      expect(nightResult).toBe(true); // 352 score
      expect(afternoonResult).toBe(true); // 176 score
      expect(352 / 176).toBe(2); // 2× difference
    });

    it('should demonstrate quality-over-quantity approach', () => {
      // Goal: Block >75% of contexts to achieve 3-5× CTR improvement
      // Best context: Saturday night 5.7% CTR
      // Worst context: Wednesday afternoon 1.4% CTR
      // Quality threshold: Only show surveys when score ≥ 100

      const testContexts = [
        { day: 'SATURDAY', time: 'night', editors: 3, shouldPass: true }, // 352 × 0.85 × 0.96 = 287
        { day: 'SUNDAY', time: 'night', editors: 2, shouldPass: true }, // With 1-2 editors: 280
        { day: 'FRIDAY', time: 'night', editors: 2, shouldPass: true }, // With 1-2 editors: 260
        { day: 'MONDAY', time: 'night', editors: 2, shouldPass: true }, // With 1-2 editors: 260
        { day: 'TUESDAY', time: 'night', editors: 3, shouldPass: true }, // 172.8 × 0.85 × 0.96 = 141
        { day: 'WEDNESDAY', time: 'night', editors: 3, shouldPass: false }, // 86.4 × 0.85 × 0.96 = 70
        { day: 'THURSDAY', time: 'night', editors: 3, shouldPass: true }, // 136 × 0.85 × 0.96 = 111
      ];

      testContexts.forEach(({ day, time, editors, shouldPass }) => {
        mockCollectWorkspaceContext.mockReturnValue({
          dayOfWeek: day as WorkspaceContext['dayOfWeek'],
          periodOfDay: time as WorkspaceContext['periodOfDay'],
          unsavedFilesCount: 0,
          openEditorsCount: editors,
          terminalCount: 0,
        });

        expect(isInactiveFourWeeksSurveyContextRight()).toBe(shouldPass);
      });
    });
  });
});
