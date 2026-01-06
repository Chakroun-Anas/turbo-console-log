import {
  shouldShowNotification,
  recordNotificationShown,
  recordDismissal,
  resetDismissalCounter,
  undoNotificationRecording,
} from '@/notifications/notificationCooldown';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import vscode from 'vscode';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { createTelemetryService } from '@/telemetry/telemetryService';

jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/telemetry/telemetryService');

describe('notificationCooldown', () => {
  let mockContext: vscode.ExtensionContext;
  let globalStateStore: Map<string, unknown>;
  let mockReadFromGlobalState: jest.MockedFunction<typeof readFromGlobalState>;
  let mockWriteToGlobalState: jest.MockedFunction<typeof writeToGlobalState>;
  let mockCreateTelemetryService: jest.MockedFunction<
    typeof createTelemetryService
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Suppress console.log output in tests
    jest.spyOn(console, 'log').mockImplementation();

    // Create a proper state store that persists values
    globalStateStore = new Map();

    // Mock telemetry service to prevent real network calls
    mockCreateTelemetryService = createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;
    mockCreateTelemetryService.mockReturnValue({
      reportFreshInstall: jest.fn(),
      reportUpdate: jest.fn(),
      reportCommandsInserted: jest.fn(),
      reportFreemiumPanelOpening: jest.fn(),
      reportFreemiumPanelCtaClick: jest.fn(),
      dispose: jest.fn(),
      reportNotificationInteraction: jest.fn(),
      reportWebviewInteraction: jest.fn(),
      reportNotificationLimitReached: jest.fn().mockResolvedValue(undefined),
      reportNotificationsPaused: jest.fn().mockResolvedValue(undefined),
    } as ReturnType<typeof createTelemetryService>);

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

      describe('monthly notification limit', () => {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        it('should allow notification when count is 0', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 0);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(true);
        });

        it('should allow notification when count is 1', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 1);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          );

          expect(result).toBe(true);
        });

        it('should allow notification when count is 3 (below limit)', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 3);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
          );

          expect(result).toBe(true);
        });

        it('should reject notification when count is exactly 4 (at limit)', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          expect(result).toBe(false);
        });

        it('should reject notification when count exceeds limit (5)', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 5);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
          );

          expect(result).toBe(false);
        });

        it('should reject notification when count far exceeds limit (10)', () => {
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            currentMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 10);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
          );

          expect(result).toBe(false);
        });

        it('should allow notification when month changes despite high count', () => {
          // Set old month with high count
          const oldMonthKey = '2024-11';
          globalStateStore.set(
            GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
            oldMonthKey,
          );
          globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 10);

          // Current month check should pass (month mismatch means counter is stale)
          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          );

          // Note: This will return true because the month key doesn't match,
          // so the stale counter is effectively ignored
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

        it('should return true when LAST_SHOWN_NOTIFICATION is set to 0 (after undo)', () => {
          // Simulate undoNotificationRecording setting timestamp to 0
          globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, 0);

          const result = shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          );

          // Should allow notification immediately (now - 0 > COOLDOWN_PERIOD)
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

      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

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
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
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
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      const afterCall = Date.now();

      const recordedTimestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      ) as number;

      expect(recordedTimestamp).toBeDefined();
      expect(recordedTimestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(recordedTimestamp).toBeLessThanOrEqual(afterCall);
    });

    describe('monthly notification counter', () => {
      it('should initialize counter to 1 when no previous data exists', () => {
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        const monthlyCount = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        );
        expect(monthlyCount).toBe(1);
      });

      it('should increment counter within the same month', () => {
        // Set current month
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
          currentMonthKey,
        );
        globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 2);

        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        const monthlyCount = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        );
        expect(monthlyCount).toBe(3);
      });

      it('should reset counter to 1 when month changes', () => {
        // Set previous month (December 2024)
        const previousMonthKey = '2024-12';
        globalStateStore.set(
          GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
          previousMonthKey,
        );
        globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

        // Record notification in current month (will be different)
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        const monthlyCount = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        );
        expect(monthlyCount).toBe(1);
      });

      it('should update month key to current month', () => {
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        const now = new Date();
        const expectedMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const storedMonthKey = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        );

        expect(storedMonthKey).toBe(expectedMonthKey);
      });

      it('should handle multiple increments correctly', () => {
        // First notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(1);

        // Second notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
        );
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(2);

        // Third notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
        );
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(3);

        // Fourth notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
        );
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(4);
      });

      it('should NOT increment counter for BYPASS notifications', () => {
        // Set initial counter value
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
          currentMonthKey,
        );
        globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 2);

        // Record a BYPASS notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        );

        // Counter should remain unchanged
        const monthlyCount = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        );
        expect(monthlyCount).toBe(2);
      });

      it('should update timestamp but not counter for BYPASS notifications', () => {
        const beforeCall = Date.now();

        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        );

        const afterCall = Date.now();

        // Timestamp should be updated
        const recordedTimestamp = globalStateStore.get(
          GlobalStateKey.LAST_SHOWN_NOTIFICATION,
        ) as number;
        expect(recordedTimestamp).toBeDefined();
        expect(recordedTimestamp).toBeGreaterThanOrEqual(beforeCall);
        expect(recordedTimestamp).toBeLessThanOrEqual(afterCall);

        // Counter should not be set
        const monthlyCount = globalStateStore.get(
          GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
        );
        expect(monthlyCount).toBeUndefined();
      });

      it('should not increment counter when BYPASS notification follows IGNORE notification', () => {
        // First: IGNORE notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(1);

        // Second: BYPASS notification
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        );

        // Counter should remain 1
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
        ).toBe(1);
      });
    });
  });

  describe('undoNotificationRecording', () => {
    it('should reset timestamp and decrement counter for IGNORE priority events', () => {
      // Setup: Create a counter that has been incremented and timestamp set
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 3);
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());

      // Act: Undo for an IGNORE event
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter should be decremented to 2 and timestamp reset to 0
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(2);
      expect(timestamp).toBe(0);
    });

    it('should reset timestamp but NOT decrement counter for BYPASS priority events', () => {
      // Setup: Create a counter and timestamp
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 3);
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());

      // Act: Try to undo for a BYPASS event
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
      );

      // Assert: Counter should remain unchanged but timestamp should be reset
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(3);
      expect(timestamp).toBe(0);
    });

    it('should prevent negative counters (stop at 0)', () => {
      // Setup: Counter at 0
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 0);
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());

      // Act: Try to undo when counter is 0
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter should remain at 0, timestamp reset
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(0);
      expect(timestamp).toBe(0);
    });

    it('should reset timestamp even when counter is undefined', () => {
      // Setup: No counter exists but timestamp is set
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());
      // Intentionally don't set MONTHLY_NOTIFICATION_COUNT

      // Act: Try to undo
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter remains undefined, timestamp reset to 0
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBeUndefined();
      expect(timestamp).toBe(0);
    });

    it('should reset timestamp but NOT decrement counter when month key does not match', () => {
      // Setup: Counter from previous month
      const previousMonthKey = '2024-12';
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        previousMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 3);
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());

      // Act: Try to undo in current month (different from stored month)
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter unchanged (different month), timestamp reset
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(3);
      expect(timestamp).toBe(0);
    });

    it('should reset timestamp but NOT decrement when no month key exists', () => {
      // Setup: Counter exists but no month key
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 3);
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, Date.now());
      // Intentionally don't set MONTHLY_NOTIFICATION_MONTH_KEY

      // Act: Try to undo
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter unchanged (no month key), timestamp reset
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(3);
      expect(timestamp).toBe(0);
    });

    it('should handle multiple undos correctly', () => {
      // Setup: Counter at 4
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

      // Act: Undo multiple times (each resets timestamp)
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(3);
      expect(globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION)).toBe(
        0,
      );

      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(2);
      expect(globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION)).toBe(
        0,
      );

      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(1);
      expect(globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION)).toBe(
        0,
      );

      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(0);
      expect(globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION)).toBe(
        0,
      );

      // Fifth undo should not go below 0
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(0);
      expect(globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION)).toBe(
        0,
      );
    });

    it('should work in the deactivated variant scenario', () => {
      // Setup: Simulate the exact scenario from showNotification
      // 1. Counter starts at 2
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 2);

      // 2. recordNotificationShown increments to 3 and sets timestamp
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(3);
      expect(
        globalStateStore.get(GlobalStateKey.LAST_SHOWN_NOTIFICATION),
      ).toBeGreaterThan(0);

      // 3. Variant is deactivated, so undo (resets timestamp and decrements)
      undoNotificationRecording(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Assert: Counter back to 2, timestamp reset (no cooldown penalty)
      const monthlyCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      const timestamp = globalStateStore.get(
        GlobalStateKey.LAST_SHOWN_NOTIFICATION,
      );
      expect(monthlyCount).toBe(2);
      expect(timestamp).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should allow IGNORE event after recording and waiting past cooldown', () => {
      // Record a notification shown
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

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
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

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
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

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

    it('should enforce monthly limit across multiple notifications', () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Set past cooldown so we only test monthly limit
      const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );

      // Show 4 notifications (hitting the limit)
      for (let i = 0; i < 4; i++) {
        expect(
          shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          ),
        ).toBe(true);
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        // Reset cooldown to allow next notification
        globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);
      }

      // 5th notification should be blocked
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        ),
      ).toBe(false);
    });

    it('should not count BYPASS notifications against monthly limit', () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

      // BYPASS notifications should still work even at monthly limit
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

    it('should reset monthly counter when new month starts', () => {
      // Set previous month with count at limit
      const previousMonthKey = '2024-12';
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        previousMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

      // Past cooldown
      const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);

      // Should allow notification (month changed, so counter is stale)
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        ),
      ).toBe(true);

      // Record notification - should reset counter to 1
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      const updatedCount = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_COUNT,
      );
      expect(updatedCount).toBe(1);

      const now = new Date();
      const expectedMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const updatedMonthKey = globalStateStore.get(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
      );
      expect(updatedMonthKey).toBe(expectedMonthKey);
    });

    it('should allow 4 PLG + 2 BYPASS notifications in same month', () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;

      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);

      // Show 2 BYPASS notifications (don't count)
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
      );
      recordNotificationShown(
        mockContext,
        NotificationEvent.EXTENSION_PHP_PRO_ONLY,
      );

      // Counter should still be 0
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBeUndefined();

      // Show 4 PLG notifications (should all succeed)
      for (let i = 0; i < 4; i++) {
        globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);
        expect(
          shouldShowNotification(
            mockContext,
            NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          ),
        ).toBe(true);
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );
      }

      // Counter should be 4
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT),
      ).toBe(4);

      // 5th PLG notification should be blocked
      globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
        ),
      ).toBe(false);

      // But BYPASS should still work
      expect(
        shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        ),
      ).toBe(true);
    });

    it('should report limit reached only once per month', () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

      const mockTelemetryService = mockCreateTelemetryService.mockReturnValue({
        reportFreshInstall: jest.fn(),
        reportUpdate: jest.fn(),
        reportCommandsInserted: jest.fn(),
        reportFreemiumPanelOpening: jest.fn(),
        reportFreemiumPanelCtaClick: jest.fn(),
        dispose: jest.fn(),
        reportNotificationInteraction: jest.fn(),
        reportWebviewInteraction: jest.fn(),
        reportNotificationLimitReached: jest.fn().mockResolvedValue(undefined),
        reportNotificationsPaused: jest.fn().mockResolvedValue(undefined),
      } as ReturnType<typeof createTelemetryService>);

      // First call - should report
      shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).toHaveBeenCalledWith(currentMonthKey, 4, 4);

      // Simulate that the report was successful and month key was stored
      globalStateStore.set(
        GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH,
        currentMonthKey,
      );

      // Clear mock calls
      jest.clearAllMocks();

      // Second call in same month - should NOT report again
      shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      );

      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).not.toHaveBeenCalled();

      // Third call in same month - should still NOT report
      shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
      );

      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).not.toHaveBeenCalled();
    });

    it('should report again when a new month starts', () => {
      const oldMonthKey = '2025-11';
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Set up state from previous month
      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 5);
      globalStateStore.set(
        GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH,
        oldMonthKey,
      ); // Already reported for old month

      const mockTelemetryService = mockCreateTelemetryService.mockReturnValue({
        reportFreshInstall: jest.fn(),
        reportUpdate: jest.fn(),
        reportCommandsInserted: jest.fn(),
        reportFreemiumPanelOpening: jest.fn(),
        reportFreemiumPanelCtaClick: jest.fn(),
        dispose: jest.fn(),
        reportNotificationInteraction: jest.fn(),
        reportWebviewInteraction: jest.fn(),
        reportNotificationLimitReached: jest.fn().mockResolvedValue(undefined),
        reportNotificationsPaused: jest.fn().mockResolvedValue(undefined),
      } as ReturnType<typeof createTelemetryService>);

      // Call with current month - should report because it's a new month
      shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService().reportNotificationLimitReached,
      ).toHaveBeenCalledWith(currentMonthKey, 5, 4);
    });

    it('should update MONTHLY_LIMIT_REPORTED_FOR_MONTH after successful report', async () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      globalStateStore.set(
        GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
        currentMonthKey,
      );
      globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

      // Verify initial state - not yet reported for this month
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH),
      ).toBeUndefined();

      // Trigger the notification check
      shouldShowNotification(
        mockContext,
        NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
      );

      // Wait for promise to resolve
      await new Promise(process.nextTick);

      // Verify writeToGlobalState was called to update the reported month
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH,
        currentMonthKey,
      );

      // Verify the state was actually updated in our mock store
      expect(
        globalStateStore.get(GlobalStateKey.MONTHLY_LIMIT_REPORTED_FOR_MONTH),
      ).toBe(currentMonthKey);
    });
  });

  describe('dismissal tracking and pause system', () => {
    describe('recordDismissal', () => {
      it('should increment consecutive dismissal counter', () => {
        recordDismissal(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
          1,
        );
      });

      it('should increment from existing count', () => {
        const currentMonth = new Date();
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          monthKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 1);

        recordDismissal(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
          2,
        );
      });

      it('should pause notifications when reaching 3 dismissals', () => {
        const currentMonth = new Date();
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          monthKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        const now = new Date();
        const expectedEndOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
          0,
          0,
          0,
          0,
        ).getTime();

        recordDismissal(mockContext);

        // Should set pause timestamp
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          expectedEndOfMonth,
        );
      });

      it('should report to analytics when pausing', () => {
        const currentMonth = new Date();
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          monthKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        const mockTelemetryService = mockCreateTelemetryService();

        recordDismissal(mockContext);

        expect(
          mockTelemetryService.reportNotificationsPaused,
        ).toHaveBeenCalled();

        const mockFn =
          mockTelemetryService.reportNotificationsPaused as jest.MockedFunction<
            typeof mockTelemetryService.reportNotificationsPaused
          >;
        const callArgs = mockFn.mock.calls[0];
        const [reportedMonthKey, consecutiveDismissals, pausedUntil] = callArgs;

        const now = new Date();
        const expectedMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        expect(reportedMonthKey).toBe(expectedMonthKey);
        expect(consecutiveDismissals).toBe(3);
        expect(pausedUntil).toBeGreaterThan(Date.now());
      });

      it('should not pause before reaching threshold', () => {
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 1);

        recordDismissal(mockContext);

        expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          expect.anything(),
        );
      });

      it('should report pause only once per month', () => {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          currentMonthKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        const mockTelemetryService = mockCreateTelemetryService();

        // First time reaching threshold
        recordDismissal(mockContext);

        expect(
          mockTelemetryService.reportNotificationsPaused,
        ).toHaveBeenCalledTimes(1);

        // Simulate successful report stored the month key
        globalStateStore.set(
          GlobalStateKey.PAUSE_REPORTED_FOR_MONTH,
          currentMonthKey,
        );

        jest.clearAllMocks();

        // Set counter back to 2 and dismiss again
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);
        recordDismissal(mockContext);

        // Should NOT report again
        expect(
          mockTelemetryService.reportNotificationsPaused,
        ).not.toHaveBeenCalled();
      });

      it('should report again when new month starts', () => {
        const oldMonthKey = '2025-11';
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Set current month (so counter doesn't reset)
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          currentMonthKey,
        );
        // Start with 3 dismissals in new month
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 3);
        globalStateStore.set(
          GlobalStateKey.PAUSE_REPORTED_FOR_MONTH,
          oldMonthKey,
        );

        const mockTelemetryService = mockCreateTelemetryService();

        // Increment in new month (should trigger pause)
        recordDismissal(mockContext);

        // Should report because it's a different month
        expect(
          mockTelemetryService.reportNotificationsPaused,
        ).toHaveBeenCalledTimes(1);
        expect(
          mockTelemetryService.reportNotificationsPaused,
        ).toHaveBeenCalledWith(currentMonthKey, 4, expect.any(Number));
      });

      it('should update PAUSE_REPORTED_FOR_MONTH after successful report', async () => {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          currentMonthKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        // Verify initial state - not yet reported for this month
        expect(
          globalStateStore.get(GlobalStateKey.PAUSE_REPORTED_FOR_MONTH),
        ).toBeUndefined();

        // Trigger third dismissal
        recordDismissal(mockContext);

        // Wait for promise to resolve
        await new Promise(process.nextTick);

        // Verify writeToGlobalState was called to update the reported month
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.PAUSE_REPORTED_FOR_MONTH,
          currentMonthKey,
        );

        // Verify the state was actually updated in our mock store
        expect(
          globalStateStore.get(GlobalStateKey.PAUSE_REPORTED_FOR_MONTH),
        ).toBe(currentMonthKey);
      });
    });

    describe('resetDismissalCounter', () => {
      it('should reset counter to 0', () => {
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        resetDismissalCounter(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
          0,
        );
      });

      it('should work when counter does not exist', () => {
        resetDismissalCounter(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
          0,
        );
      });
    });

    describe('shouldShowNotification with pause', () => {
      it('should return false when notifications are paused', () => {
        const futureTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
        globalStateStore.set(
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          futureTimestamp,
        );

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        expect(result).toBe(false);
      });

      it('should clear pause when expired', () => {
        const pastTimestamp = Date.now() - 1000; // 1 second ago
        globalStateStore.set(
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          pastTimestamp,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 3);

        // Set past cooldown to isolate pause test
        const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
        globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        // Should clear the pause
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          undefined,
        );

        // Should reset dismissal counter
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT,
          0,
        );

        // Should allow notification
        expect(result).toBe(true);
      });

      it('should always allow BYPASS notifications even when paused', () => {
        const futureTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
        globalStateStore.set(
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          futureTimestamp,
        );

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FRESH_INSTALL,
        );

        expect(result).toBe(true);
      });

      it('should check pause before monthly limit', () => {
        const futureTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Set both pause and monthly limit reached
        globalStateStore.set(
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          futureTimestamp,
        );
        globalStateStore.set(
          GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY,
          currentMonthKey,
        );
        globalStateStore.set(GlobalStateKey.MONTHLY_NOTIFICATION_COUNT, 4);

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        // Should block due to pause (not monthly limit)
        expect(result).toBe(false);

        // Should NOT report monthly limit reached (pause check comes first)
        const mockTelemetryService = mockCreateTelemetryService();
        expect(
          mockTelemetryService.reportNotificationLimitReached,
        ).not.toHaveBeenCalled();
      });
    });

    describe('integration scenarios with dismissals', () => {
      it('should pause after 3 consecutive dismissals', () => {
        const currentMonth = new Date();
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          monthKey,
        );

        // First dismissal
        recordDismissal(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(1);

        // Second dismissal
        recordDismissal(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(2);

        // Third dismissal - should pause
        recordDismissal(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(3);
        expect(
          globalStateStore.get(GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL),
        ).toBeGreaterThan(Date.now());

        // Next notification should be blocked
        const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
        globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);

        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );
        expect(result).toBe(false);
      });

      it('should reset counter on CTA click before reaching threshold', () => {
        const currentMonth = new Date();
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          monthKey,
        );

        // Two dismissals
        recordDismissal(mockContext);
        recordDismissal(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(2);

        // User clicks CTA
        resetDismissalCounter(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(0);

        // Next dismissals start from zero again
        recordDismissal(mockContext);
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(1);
      });

      it('should clear pause when new month starts', () => {
        // Set pause in "previous month" (simulate by setting pause to past)
        const pastTimestamp = Date.now() - 1000;
        globalStateStore.set(
          GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL,
          pastTimestamp,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 3);

        // Past cooldown
        const longAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
        globalStateStore.set(GlobalStateKey.LAST_SHOWN_NOTIFICATION, longAgo);

        // Should allow notification and clear pause
        const result = shouldShowNotification(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );
        expect(result).toBe(true);
        expect(
          globalStateStore.get(GlobalStateKey.NOTIFICATIONS_PAUSED_UNTIL),
        ).toBeUndefined();
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(0);
      });

      it('should reset dismissal counter when month changes, even if notification was shown in new month', () => {
        // Simulate December: set the dismissal tracking month and counter manually
        const decemberKey = '2024-12';
        globalStateStore.set(
          GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY,
          decemberKey,
        );
        globalStateStore.set(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT, 2);

        // Simulate January: notification is shown (updates MONTHLY_NOTIFICATION_MONTH_KEY)
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        recordNotificationShown(
          mockContext,
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
        );

        // Verify MONTHLY_NOTIFICATION_MONTH_KEY was updated to current month
        expect(
          globalStateStore.get(GlobalStateKey.MONTHLY_NOTIFICATION_MONTH_KEY),
        ).toBe(currentMonthKey);

        // Verify DISMISSAL_TRACKING_MONTH_KEY is still December (unchanged by recordNotificationShown)
        expect(
          globalStateStore.get(GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY),
        ).toBe(decemberKey);

        // Now user dismisses in new month
        recordDismissal(mockContext);

        // Dismissal counter should be 1 (reset because month changed), NOT 3
        // This is the key assertion that validates our fix
        expect(
          globalStateStore.get(GlobalStateKey.CONSECUTIVE_DISMISSALS_COUNT),
        ).toBe(1);

        // DISMISSAL_TRACKING_MONTH_KEY should now be updated to current month
        expect(
          globalStateStore.get(GlobalStateKey.DISMISSAL_TRACKING_MONTH_KEY),
        ).toBe(currentMonthKey);
      });
    });
  });
});
