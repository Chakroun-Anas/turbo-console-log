import * as vscode from 'vscode';
import {
  trackLogInsertions,
  clearFilesWithLogsInSession,
} from '@/helpers/trackLogInsertions';
import {
  readFromGlobalState,
  writeToGlobalState,
  isProUser,
  trackStreakDays,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
  trackStreakDays: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('trackLogInsertions', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockTrackStreakDays = trackStreakDays as jest.MockedFunction<
    typeof trackStreakDays
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
    // Default: return streak count of 1 (no special behavior)
    mockTrackStreakDays.mockReturnValue(1);
    // Default: no active editor (prevents multi-file tracking interference)
    Object.defineProperty(vscode.window, 'activeTextEditor', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    // Clear session-based file tracking between tests
    clearFilesWithLogsInSession();
  });

  describe('when user is a Pro user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 25;
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });
    });

    it('should increment counter but not show notification', async () => {
      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        26,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification even at 50 inserts milestone', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 49; // Will become 50
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        50,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION',
        true,
      );
    });
  });

  describe('when user is a free user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should increment command usage count', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        6,
      );
    });

    it('should update last insertion date on every call', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      // Should write LAST_INSERTION_DATE with normalized date (midnight)
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'LAST_INSERTION_DATE',
        expect.any(Number),
      );
    });

    it('should handle undefined command usage count as 0', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return undefined;
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        1,
      );
    });

    it('should not show milestone notifications when count is less than 10', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show milestone notifications when count is between milestones', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 30;
        if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION') return true;
        if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
          return true;
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    describe('when reaching 3-day streak', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 5;
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return false;
          return undefined;
        });
        // Mock trackStreakDays to return 3
        mockTrackStreakDays.mockReturnValue(3);
      });

      it('should show three-day streak notification at exactly 3 days', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_THREE_DAY_STREAK,
          '3.0.0',
          mockContext,
        );
      });

      it('should show three-day streak notification even if streak was missed', async () => {
        // Mock trackStreakDays to return 5 (missed the 3-day mark)
        mockTrackStreakDays.mockReturnValue(5);

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_THREE_DAY_STREAK,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        // Mock showNotification to return true (notification was shown)
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        // Mock showNotification to return false (blocked by cooldown)
        mockShowNotification.mockResolvedValue(false);

        await trackLogInsertions(mockContext);

        // Should have two calls: incrementing counter + updating last insertion date
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          6,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'LAST_INSERTION_DATE',
          expect.any(Number),
        );
      });

      it('should take priority over milestone notifications', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 9; // Will become 10, milestone eligible
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return false;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
        mockTrackStreakDays.mockReturnValue(3);
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        // Should show streak notification, not milestone notification
        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_THREE_DAY_STREAK,
          '3.0.0',
          mockContext,
        );
        expect(mockShowNotification).not.toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TEN_INSERTS,
          '3.0.0',
          mockContext,
        );
      });
    });

    describe('when user has already seen three-day streak notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 5;
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return true;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
        // Mock trackStreakDays to return 3 or higher
        mockTrackStreakDays.mockReturnValue(3);
      });

      it('should not show three-day streak notification again even with streak >= 3', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should not show notification even when streak count is higher', async () => {
        mockTrackStreakDays.mockReturnValue(10);

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reaching 3+ files with logs in session', () => {
      let mockActiveEditor: vscode.TextEditor;
      let mockDocument1: vscode.TextDocument;
      let mockDocument2: vscode.TextDocument;
      let mockDocument3: vscode.TextDocument;

      beforeEach(() => {
        // Create mock documents with different URIs
        mockDocument1 = {
          uri: { toString: () => 'file:///path/to/file1.ts' },
        } as vscode.TextDocument;
        mockDocument2 = {
          uri: { toString: () => 'file:///path/to/file2.ts' },
        } as vscode.TextDocument;
        mockDocument3 = {
          uri: { toString: () => 'file:///path/to/file3.ts' },
        } as vscode.TextDocument;

        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 5;
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return true;
          if (key === 'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION') return false;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
        mockTrackStreakDays.mockReturnValue(1);
      });

      it('should show multi-file logs notification when 3rd file is logged', async () => {
        // First file
        mockActiveEditor = {
          document: mockDocument1,
        } as vscode.TextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: mockActiveEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        // Second file
        mockActiveEditor = {
          document: mockDocument2,
        } as vscode.TextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: mockActiveEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        // Third file - should trigger notification
        mockActiveEditor = {
          document: mockDocument3,
        } as vscode.TextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: mockActiveEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_MULTI_FILE_LOGS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        mockShowNotification.mockResolvedValue(true);

        // Insert in 3 files
        for (const doc of [mockDocument1, mockDocument2, mockDocument3]) {
          Object.defineProperty(vscode.window, 'activeTextEditor', {
            value: { document: doc } as vscode.TextEditor,
            writable: true,
            configurable: true,
          });
          await trackLogInsertions(mockContext);
        }

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        mockShowNotification.mockResolvedValue(false);

        // Insert in 3 files
        for (const doc of [mockDocument1, mockDocument2, mockDocument3]) {
          Object.defineProperty(vscode.window, 'activeTextEditor', {
            value: { document: doc } as vscode.TextEditor,
            writable: true,
            configurable: true,
          });
          await trackLogInsertions(mockContext);
        }

        expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION',
          true,
        );
      });

      it('should not count same file multiple times', async () => {
        // Insert in same file 5 times
        mockActiveEditor = { document: mockDocument1 } as vscode.TextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: mockActiveEditor,
          writable: true,
          configurable: true,
        });

        for (let i = 0; i < 5; i++) {
          await trackLogInsertions(mockContext);
        }

        // Should not trigger notification - only 1 unique file
        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should take priority over milestone notifications', async () => {
        // User has done 7 insertions. On the 3rd file insertion (total 10 inserts),
        // both multi-file AND milestone are eligible. Multi-file should win.
        let multiFileNotificationShown = false;
        let commandCount = 7;

        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return commandCount;
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return true;
          if (key === 'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION')
            return multiFileNotificationShown;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });

        mockWriteToGlobalState.mockImplementation((context, key, value) => {
          if (key === 'COMMAND_USAGE_COUNT') {
            commandCount = value as number;
          }
          if (
            key === 'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION' &&
            value === true
          ) {
            multiFileNotificationShown = true;
          }
        });

        mockShowNotification.mockResolvedValue(true);

        // First file: count goes to 8
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: { document: mockDocument1 } as vscode.TextEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        // Second file: count goes to 9
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: { document: mockDocument2 } as vscode.TextEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        // Third file: count goes to 10 (milestone eligible) AND 3 files (multi-file eligible)
        Object.defineProperty(vscode.window, 'activeTextEditor', {
          value: { document: mockDocument3 } as vscode.TextEditor,
          writable: true,
          configurable: true,
        });
        await trackLogInsertions(mockContext);

        // Should show multi-file notification on the third call (priority over milestone)
        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_MULTI_FILE_LOGS,
          '3.0.0',
          mockContext,
        );
        expect(mockShowNotification).not.toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TEN_INSERTS,
          '3.0.0',
          mockContext,
        );
      });
    });

    describe('when user has already seen multi-file logs notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 5;
          if (key === 'HAS_SHOWN_THREE_DAY_STREAK_NOTIFICATION') return true;
          if (key === 'HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION') return true;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should not show multi-file logs notification again', async () => {
        // Insert in multiple files
        for (let i = 0; i < 5; i++) {
          const mockDoc = {
            uri: { toString: () => `file:///path/to/file${i}.ts` },
          } as vscode.TextDocument;
          Object.defineProperty(vscode.window, 'activeTextEditor', {
            value: { document: mockDoc } as vscode.TextEditor,
            writable: true,
            configurable: true,
          });
          await trackLogInsertions(mockContext);
        }

        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reaching 10 inserts milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 9; // Will become 10 after increment
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should show ten inserts notification at exactly 10', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TEN_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should show ten inserts notification even if milestone was missed', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 14; // Will become 15, missed 10
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TEN_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        // Mock showNotification to return true (notification was shown)
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        // Mock showNotification to return false (blocked by cooldown)
        mockShowNotification.mockResolvedValue(false);

        await trackLogInsertions(mockContext);

        // Should have two calls: incrementing counter + updating last insertion date
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          10,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'LAST_INSERTION_DATE',
          expect.any(Number),
        );
      });
    });

    describe('when user has already seen ten inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 15;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should still increment counter but not show ten inserts notification again', async () => {
        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          16,
        );
        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reaching 20 inserts milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 19; // Will become 20 after increment
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown at 10
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should show twenty inserts notification at exactly 20', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TWENTY_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should show twenty inserts notification even if milestone was missed', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 24; // Will become 25, missed 20
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TWENTY_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        // Mock showNotification to return true (notification was shown)
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        // Mock showNotification to return false (blocked by cooldown)
        mockShowNotification.mockResolvedValue(false);

        await trackLogInsertions(mockContext);

        // Should have two calls: incrementing counter + updating last insertion date
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          20,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'LAST_INSERTION_DATE',
          expect.any(Number),
        );
      });

      it('should skip twenty inserts notification if user already hit 50', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 19; // Will become 20
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true; // User already saw 50 milestone
          return undefined;
        });

        await trackLogInsertions(mockContext);

        // Should NOT show notification
        expect(mockShowNotification).not.toHaveBeenCalled();

        // Should silently mark 20 as shown
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION',
          true,
        );
      });
    });

    describe('when user has already seen twenty inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 25;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should still increment counter but not show twenty inserts notification again', async () => {
        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          26,
        );
        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reaching 50 inserts milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 49; // Will become 50 after increment
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown at 10
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown at 20
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should show fifty inserts notification at exactly 50', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIFTY_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should show fifty inserts notification even if milestone was missed', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 54; // Will become 55, missed 50
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIFTY_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        // Mock showNotification to return true (notification was shown)
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        // Mock showNotification to return false (blocked by cooldown)
        mockShowNotification.mockResolvedValue(false);

        await trackLogInsertions(mockContext);

        // Should have two calls: incrementing counter + updating last insertion date
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          50,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'LAST_INSERTION_DATE',
          expect.any(Number),
        );
      });
    });

    describe('when user has already seen fifty inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 60;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should still increment counter but not show notification', async () => {
        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          61,
        );
        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('when reaching 100 inserts milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 99; // Will become 100 after increment
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });
      });

      it('should show hundred inserts notification at exactly 100', async () => {
        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_HUNDRED_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should show hundred inserts notification even if milestone was missed', async () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 104; // Will become 105, missed 100
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION')
            return false;
          return undefined;
        });

        await trackLogInsertions(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_HUNDRED_INSERTS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown only when actually displayed', async () => {
        // Mock showNotification to return true (notification was shown)
        mockShowNotification.mockResolvedValue(true);

        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should not mark notification as shown when blocked by cooldown', async () => {
        // Mock showNotification to return false (blocked by cooldown)
        mockShowNotification.mockResolvedValue(false);

        await trackLogInsertions(mockContext);

        // Should have two calls: incrementing counter + updating last insertion date
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(2);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          100,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'LAST_INSERTION_DATE',
          expect.any(Number),
        );
      });
    });

    describe('when user has already seen hundred inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 110;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          if (key === 'HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION')
            return true;
          return undefined;
        });
      });

      it('should still increment counter but not show notification', async () => {
        await trackLogInsertions(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          111,
        );
        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });
  });
});
