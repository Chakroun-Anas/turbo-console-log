import * as vscode from 'vscode';
import { updateUserActivityStatus } from '@/helpers/updateUserActivityStatus';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');

describe('updateUserActivityStatus', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;

  let mockContext: vscode.ExtensionContext;

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('when user has inserted logs before (LAST_INSERTION_DATE exists)', () => {
    describe('when last insertion was less than 7 days ago', () => {
      it('should return ACTIVE status for insertion 1 day ago', () => {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return oneDayAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.ACTIVE);
      });

      it('should return ACTIVE status for insertion 6 days ago', () => {
        const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return sixDaysAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.ACTIVE);
      });

      it('should return ACTIVE status for insertion just now', () => {
        const now = Date.now();
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return now;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.ACTIVE);
      });

      it('should write ACTIVE status to global state', () => {
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return threeDaysAgo;
          return undefined;
        });

        updateUserActivityStatus(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.USER_ACTIVITY_STATUS,
          UserActivityStatus.ACTIVE,
        );
      });

      it('should only write once to global state', () => {
        const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return twoDaysAgo;
          return undefined;
        });

        updateUserActivityStatus(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
      });
    });

    describe('when last insertion was 7 days or more ago', () => {
      it('should return INACTIVE status for insertion exactly 7 days ago', () => {
        const sevenDaysAgo = Date.now() - ONE_WEEK_MS;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return sevenDaysAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.INACTIVE);
      });

      it('should return INACTIVE status for insertion 8 days ago', () => {
        const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return eightDaysAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.INACTIVE);
      });

      it('should return INACTIVE status for insertion 30 days ago', () => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return thirtyDaysAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.INACTIVE);
      });

      it('should write INACTIVE status to global state', () => {
        const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return tenDaysAgo;
          return undefined;
        });

        updateUserActivityStatus(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.USER_ACTIVITY_STATUS,
          UserActivityStatus.INACTIVE,
        );
      });
    });

    describe('edge case: boundary at exactly 7 days minus 1ms', () => {
      it('should return ACTIVE status when insertion is 1ms before 7-day boundary', () => {
        const almostSevenDaysAgo = Date.now() - (ONE_WEEK_MS - 1);
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE)
            return almostSevenDaysAgo;
          return undefined;
        });

        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.ACTIVE);
      });
    });
  });

  describe('when user has never inserted logs (LAST_INSERTION_DATE is undefined)', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
        // Other keys handled per test
        return undefined;
      });
    });

    describe('first time checking (ACTIVITY_CHECK_START_DATE is undefined)', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
          if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
            return undefined;
          return undefined;
        });
      });

      it('should return ACTIVE status for new user', () => {
        const status = updateUserActivityStatus(mockContext);

        expect(status).toBe(UserActivityStatus.ACTIVE);
      });

      it('should set ACTIVITY_CHECK_START_DATE to current timestamp', () => {
        const beforeCall = Date.now();

        updateUserActivityStatus(mockContext);

        const afterCall = Date.now();

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.ACTIVITY_CHECK_START_DATE,
          expect.any(Number),
        );

        const setTimestamp = (mockWriteToGlobalState.mock.calls.find(
          (call) => call[1] === GlobalStateKey.ACTIVITY_CHECK_START_DATE,
        )?.[2] || 0) as number;

        expect(setTimestamp).toBeGreaterThanOrEqual(beforeCall);
        expect(setTimestamp).toBeLessThanOrEqual(afterCall);
      });

      it('should write ACTIVE status to global state', () => {
        updateUserActivityStatus(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.USER_ACTIVITY_STATUS,
          UserActivityStatus.ACTIVE,
        );
      });

      it('should write to global state exactly twice (start date + status)', () => {
        updateUserActivityStatus(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
      });
    });

    describe('subsequent checks (ACTIVITY_CHECK_START_DATE exists)', () => {
      describe('when less than 7 days since start date', () => {
        it('should return ACTIVE status for 1 day since start', () => {
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return oneDayAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.ACTIVE);
        });

        it('should return ACTIVE status for 6 days since start', () => {
          const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return sixDaysAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.ACTIVE);
        });

        it('should write ACTIVE status to global state', () => {
          const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return threeDaysAgo;
            return undefined;
          });

          updateUserActivityStatus(mockContext);

          expect(mockWriteToGlobalState).toHaveBeenCalledWith(
            mockContext,
            GlobalStateKey.USER_ACTIVITY_STATUS,
            UserActivityStatus.ACTIVE,
          );
        });

        it('should not set ACTIVITY_CHECK_START_DATE again', () => {
          const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return twoDaysAgo;
            return undefined;
          });

          updateUserActivityStatus(mockContext);

          const startDateCalls = mockWriteToGlobalState.mock.calls.filter(
            (call) => call[1] === GlobalStateKey.ACTIVITY_CHECK_START_DATE,
          );
          expect(startDateCalls).toHaveLength(0);
        });
      });

      describe('when 7 days or more since start date', () => {
        it('should return INACTIVE status for exactly 7 days since start', () => {
          const sevenDaysAgo = Date.now() - ONE_WEEK_MS;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return sevenDaysAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.INACTIVE);
        });

        it('should return INACTIVE status for 10 days since start', () => {
          const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return tenDaysAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.INACTIVE);
        });

        it('should return INACTIVE status for 30 days since start', () => {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return thirtyDaysAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.INACTIVE);
        });

        it('should write INACTIVE status to global state', () => {
          const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return fifteenDaysAgo;
            return undefined;
          });

          updateUserActivityStatus(mockContext);

          expect(mockWriteToGlobalState).toHaveBeenCalledWith(
            mockContext,
            GlobalStateKey.USER_ACTIVITY_STATUS,
            UserActivityStatus.INACTIVE,
          );
        });
      });

      describe('edge case: boundary at exactly 7 days minus 1ms from start', () => {
        it('should return ACTIVE status when 1ms before 7-day boundary', () => {
          const almostSevenDaysAgo = Date.now() - (ONE_WEEK_MS - 1);
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
            if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
              return almostSevenDaysAgo;
            return undefined;
          });

          const status = updateUserActivityStatus(mockContext);

          expect(status).toBe(UserActivityStatus.ACTIVE);
        });
      });
    });
  });

  describe('priority logic: LAST_INSERTION_DATE takes precedence', () => {
    it('should use LAST_INSERTION_DATE when both dates exist', () => {
      const recentInsertion = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
      const oldStartDate = Date.now() - 20 * 24 * 60 * 60 * 1000; // 20 days ago

      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return recentInsertion;
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
          return oldStartDate;
        return undefined;
      });

      const status = updateUserActivityStatus(mockContext);

      // Should be ACTIVE based on recent insertion, not INACTIVE from old start date
      expect(status).toBe(UserActivityStatus.ACTIVE);
    });

    it('should not check ACTIVITY_CHECK_START_DATE when LAST_INSERTION_DATE exists', () => {
      const recentInsertion = Date.now() - 1 * 24 * 60 * 60 * 1000;
      let activityCheckStartDateWasChecked = false;

      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return recentInsertion;
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          activityCheckStartDateWasChecked = true;
          return Date.now() - 30 * 24 * 60 * 60 * 1000;
        }
        return undefined;
      });

      updateUserActivityStatus(mockContext);

      // Should short-circuit and not check ACTIVITY_CHECK_START_DATE
      expect(activityCheckStartDateWasChecked).toBe(false);
    });
  });

  describe('state persistence verification', () => {
    it('should always persist USER_ACTIVITY_STATUS when LAST_INSERTION_DATE exists', () => {
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return fiveDaysAgo;
        return undefined;
      });

      updateUserActivityStatus(mockContext);

      const statusCalls = mockWriteToGlobalState.mock.calls.filter(
        (call) => call[1] === GlobalStateKey.USER_ACTIVITY_STATUS,
      );
      expect(statusCalls).toHaveLength(1);
    });

    it('should always persist USER_ACTIVITY_STATUS for subsequent checks', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) return undefined;
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE)
          return threeDaysAgo;
        return undefined;
      });

      updateUserActivityStatus(mockContext);

      const statusCalls = mockWriteToGlobalState.mock.calls.filter(
        (call) => call[1] === GlobalStateKey.USER_ACTIVITY_STATUS,
      );
      expect(statusCalls).toHaveLength(1);
    });
  });
});
