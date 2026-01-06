import * as vscode from 'vscode';
import { trackStreakDays } from '@/helpers/trackStreakDays';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
}));

describe('trackStreakDays', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('first time tracking (no previous data)', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation(() => {
        // No previous data
        return undefined;
      });
    });

    it('should initialize streak count to 1', async () => {
      const currentDate = new Date('2025-12-27T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(1);
    });

    it('should write streak count as 1 to global state', async () => {
      const currentDate = new Date('2025-12-27T10:00:00');

      trackStreakDays(mockContext, currentDate);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.STREAK_COUNT,
        1,
      );
    });
  });

  describe('same day insertion', () => {
    beforeEach(() => {
      const lastDate = new Date('2025-12-27T00:00:00').getTime();
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return lastDate;
        if (key === GlobalStateKey.STREAK_COUNT) return 2;
        return undefined;
      });
    });

    it('should not change streak count when inserting on same day', async () => {
      const currentDate = new Date('2025-12-27T15:30:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(2);
    });

    it('should not write to global state when inserting on same day', async () => {
      const currentDate = new Date('2025-12-27T15:30:00');

      trackStreakDays(mockContext, currentDate);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('consecutive day insertion', () => {
    beforeEach(() => {
      const lastDate = new Date('2025-12-26T00:00:00').getTime();
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return lastDate;
        if (key === GlobalStateKey.STREAK_COUNT) return 2;
        return undefined;
      });
    });

    it('should increment streak count when inserting on consecutive day', async () => {
      const currentDate = new Date('2025-12-27T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(3);
    });

    it('should write incremented streak count to global state', async () => {
      const currentDate = new Date('2025-12-27T10:00:00');

      trackStreakDays(mockContext, currentDate);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.STREAK_COUNT,
        3,
      );
    });

    it('should handle streak from 0 to 1 correctly', async () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
        if (key === GlobalStateKey.STREAK_COUNT) return 0;
        return undefined;
      });

      const currentDate = new Date('2025-12-27T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(1);
    });
  });

  describe('broken streak (gap > 1 day)', () => {
    beforeEach(() => {
      const lastDate = new Date('2025-12-24T00:00:00').getTime();
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return lastDate;
        if (key === GlobalStateKey.STREAK_COUNT) return 2;
        return undefined;
      });
    });

    it('should reset streak count to 1 when gap is 2 days', async () => {
      const currentDate = new Date('2025-12-26T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(1);
    });

    it('should reset streak count to 1 when gap is multiple days', async () => {
      const currentDate = new Date('2025-12-30T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(1);
    });

    it('should write reset streak count to global state', async () => {
      const currentDate = new Date('2025-12-27T10:00:00');

      trackStreakDays(mockContext, currentDate);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.STREAK_COUNT,
        1,
      );
    });
  });

  describe('date normalization', () => {
    it('should normalize dates to midnight regardless of input time', async () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE)
          return new Date('2025-12-26T23:59:59').getTime();
        if (key === GlobalStateKey.STREAK_COUNT) return 1;
        return undefined;
      });

      const currentDate = new Date('2025-12-27T00:00:01');

      const streakCount = trackStreakDays(mockContext, currentDate);

      // Should recognize as consecutive day despite time difference
      expect(streakCount).toBe(2);
    });

    it('should treat different times on same day as same day', async () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE)
          return new Date('2025-12-27T08:00:00').getTime();
        if (key === GlobalStateKey.STREAK_COUNT) return 2;
        return undefined;
      });

      const currentDate = new Date('2025-12-27T20:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      // Should not increment - same day
      expect(streakCount).toBe(2);
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined streak count as 0', async () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE)
          return new Date('2025-12-26T00:00:00').getTime();
        if (key === GlobalStateKey.STREAK_COUNT) return undefined;
        return undefined;
      });

      const currentDate = new Date('2025-12-27T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      expect(streakCount).toBe(1);
    });

    it('should handle year boundary correctly', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE)
          return new Date('2024-12-31T00:00:00').getTime();
        if (key === GlobalStateKey.STREAK_COUNT) return 2;
        return undefined;
      });

      const currentDate = new Date('2025-01-01T10:00:00');

      const streakCount = trackStreakDays(mockContext, currentDate);

      // Should increment - consecutive day across year boundary
      expect(streakCount).toBe(3);
    });
  });
});
