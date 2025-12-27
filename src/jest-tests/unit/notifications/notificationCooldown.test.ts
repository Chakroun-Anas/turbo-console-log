import {
  shouldShowNotification,
  recordNotificationShown,
} from '@/notifications/notificationCooldown';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import vscode from 'vscode';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';

jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');

describe('notificationCooldown', () => {
  let mockContext: vscode.ExtensionContext;
  let globalStateStore: Map<string, unknown>;
  let mockReadFromGlobalState: jest.MockedFunction<typeof readFromGlobalState>;
  let mockWriteToGlobalState: jest.MockedFunction<typeof writeToGlobalState>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a proper state store that persists values
    globalStateStore = new Map();

    mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
      typeof readFromGlobalState
    >;
    mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
      typeof writeToGlobalState
    >;

    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(() => []),
        setKeysForSync: jest.fn(),
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(() => []),
        setKeysForSync: jest.fn(),
      },
      extensionPath: '/mock',
      asAbsolutePath: jest.fn((path: string) => `/mock/${path}`),
    } as unknown as vscode.ExtensionContext;

    // Mock readFromGlobalState to read from our Map
    mockReadFromGlobalState.mockImplementation((context, key) => {
      return globalStateStore.get(key as string);
    });

    // Mock writeToGlobalState to update our Map
    mockWriteToGlobalState.mockImplementation((context, key, value) => {
      globalStateStore.set(key as string, value);
    });
  });

  describe('shouldShowNotification', () => {
    describe('BYPASS priority events', () => {
      it('should always return true for EXTENSION_FRESH_INSTALL (BYPASS)', () => {
        // Set last notification to now (in cooldown)
        globalStateStore.set(
          GlobalStateKey.LAST_SHOWN_NOTIFICATION,
          Date.now(),
        );

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        );

        expect(result).toBe(true);
      });
    });

    describe('IGNORE priority events', () => {
      describe('when no previous notification shown', () => {
        it('should return true for EXTENSION_FIVE_COMMENTS_COMMANDS', () => {
          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(true);
        });

        it('should return true for EXTENSION_PHP_WORKSPACE_DETECTED', () => {
          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          );

          expect(result).toBe(true);
        });

        it('should return true for EXTENSION_FIVE_UNCOMMENTS_COMMANDS', () => {
          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
          );

          expect(result).toBe(true);
        });
      });

      describe('when in cooldown period (2 days)', () => {
        it('should return false for EXTENSION_FIVE_COMMENTS_COMMANDS', () => {
          // Set last notification to 1 day ago (still in 2-day cooldown)
          const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            oneDayAgo,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(false);
        });

        it('should return false for EXTENSION_PHP_WORKSPACE_DETECTED', () => {
          // Set last notification to 1 day ago (still in 2-day cooldown)
          const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            oneDayAgo,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          );

          expect(result).toBe(false);
        });

        it('should return false when last shown was just now', () => {
          // Set last notification to right now (definitely in cooldown)
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            Date.now(),
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(false);
        });
      });

      describe('when cooldown period has expired', () => {
        it('should return true when last shown was 3 days + 1 hour ago', () => {
          // Set last notification to 3 days and 1 hour ago (cooldown expired)
          const threeDaysPlusOneHour =
            Date.now() - 3 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            threeDaysPlusOneHour,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(true);
        });

        it('should return true when last shown was 4 days ago', () => {
          // Set last notification to 4 days ago (cooldown definitely expired)
          const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            fourDaysAgo,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          );

          expect(result).toBe(true);
        });

        it('should return true when last shown was 1 week ago', () => {
          // Set last notification to 1 week ago
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            oneWeekAgo,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
          );

          expect(result).toBe(true);
        });
      });

      describe('edge cases for cooldown boundary', () => {
        it('should return true when exactly at 3-day boundary', () => {
          // Set last notification to exactly 3 days ago
          const exactlyThreeDays = Date.now() - 3 * 24 * 60 * 60 * 1000;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            exactlyThreeDays,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
          );

          // At exactly 3 days, cooldown has expired (< not <=)
          expect(result).toBe(true);
        });

        it('should return true when 1 millisecond past 3-day boundary', () => {
          // Set last notification to 3 days + 1ms ago
          const threeDaysPlusOne = Date.now() - 3 * 24 * 60 * 60 * 1000 - 1;
          globalStateStore.set(
            GlobalStateKey.LAST_SHOWN_NOTIFICATION,
            threeDaysPlusOne,
          );

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
          );

          expect(result).toBe(true);
        });
      });
    });
  });

  describe('recordNotificationShown', () => {
    it('should update global state with current timestamp', () => {
      const beforeCall = Date.now();

      recordNotificationShown(mockContext);

      const afterCall = Date.now();
      const recordedTimestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      ) as number;

      expect(recordedTimestamp).toBeDefined();
      expect(recordedTimestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(recordedTimestamp).toBeLessThanOrEqual(afterCall);
    });

    it('should overwrite previous timestamp', () => {
      // Set an old timestamp
      const oldTimestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      globalStateStore.set(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
        oldTimestamp,
      );

      const beforeCall = Date.now();
      recordNotificationShown(mockContext);
      const afterCall = Date.now();

      const recordedTimestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      ) as number;

      expect(recordedTimestamp).not.toBe(oldTimestamp);
      expect(recordedTimestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(recordedTimestamp).toBeLessThanOrEqual(afterCall);
    });

    it('should work when no previous timestamp exists', () => {
      // Ensure no previous value
      expect(
        globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION),
      ).toBeUndefined();

      const beforeCall = Date.now();
      recordNotificationShown(mockContext);
      const afterCall = Date.now();

      const recordedTimestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      ) as number;

      expect(recordedTimestamp).toBeDefined();
      expect(recordedTimestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(recordedTimestamp).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('integration scenarios', () => {
    it('should allow IGNORE event after recording and waiting past cooldown', () => {
      // Record a notification shown
      recordNotificationShown(mockContext);

      // Check immediately - should be in cooldown
      let result = shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      expect(result).toBe(false);

      // Simulate time passing (4 days)
      const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, fourDaysAgo);

      // Check again - should be allowed now
      result = shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      expect(result).toBe(true);
    });

    it('should always allow BYPASS events regardless of cooldown state', () => {
      // Record a notification shown
      recordNotificationShown(mockContext);

      // BYPASS events should work immediately even though we just recorded
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        ),
      ).toBe(true);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        ),
      ).toBe(true);
    });

    it('should block multiple IGNORE events during cooldown period', () => {
      // Record a notification shown
      recordNotificationShown(mockContext);

      // All IGNORE events should be blocked
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
        ),
      ).toBe(false);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        ),
      ).toBe(false);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
        ),
      ).toBe(false);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
        ),
      ).toBe(false);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
        ),
      ).toBe(false);
    });
  });
});
