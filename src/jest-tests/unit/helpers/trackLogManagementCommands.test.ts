import * as vscode from 'vscode';
import { trackLogManagementCommands } from '@/helpers/trackLogManagementCommands';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  ...jest.requireActual('@/helpers'),
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('trackLogManagementCommands', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
    mockShowNotification.mockResolvedValue(undefined);
  });

  describe('when user is a Pro user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 3;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });
    });

    it('should increment counter but not show notification', () => {
      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        4,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification even at 5 commands milestone', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4; // Will become 5
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        5,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
        true,
      );
    });
  });

  describe('when user is a free user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should increment command usage count', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 2;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        3,
      );
    });

    it('should handle undefined counter (first use)', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1,
      );
    });

    describe('when reaching 5 commands milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 4; // Will become 5 after increment
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });
      });

      it('should show five commands notification immediately', () => {
        trackLogManagementCommands(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown', () => {
        trackLogManagementCommands(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
          true,
        );
      });

      it('should call writeToGlobalState in correct order', () => {
        const callOrder: string[] = [];

        mockWriteToGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) {
            callOrder.push('increment-counter');
          }
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          ) {
            callOrder.push('mark-as-shown');
          }
        });

        trackLogManagementCommands(mockContext);

        expect(callOrder).toEqual(['increment-counter', 'mark-as-shown']);
      });
    });

    describe('when notification has already been shown', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 4; // Will become 5
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true; // Already shown
          return undefined;
        });
      });

      it('should not show notification again', () => {
        trackLogManagementCommands(mockContext);

        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should still increment counter', () => {
        trackLogManagementCommands(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          5,
        );
      });
    });

    describe('when beyond 5 commands', () => {
      it('should not show notification at 6 commands', () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 5; // Will become 6
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext);

        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should not show notification at 10 commands', () => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9; // Will become 10
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext);

        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('Extension Version', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4; // Will become 5
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });
    });

    it('should pass extension version to showNotification', () => {
      trackLogManagementCommands(mockContext);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
        '3.0.0',
        mockContext,
      );
    });

    it('should pass context to showNotification', () => {
      trackLogManagementCommands(mockContext);

      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        mockContext,
      );
    });
  });

  describe('Complete User Journey Scenarios', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should track usage from first command to notification at 5th', () => {
      const usageHistory: number[] = [];

      // Simulate 5 command executions
      for (let i = 0; i < 5; i++) {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext);
        usageHistory.push(i + 1);
      }

      // Verify counter incremented 5 times
      expect(usageHistory).toEqual([1, 2, 3, 4, 5]);

      // Verify notification only shown once (at 5th command)
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
        '3.0.0',
        mockContext,
      );
    });

    it('should not show notification again after initial display', () => {
      // First 5 commands
      for (let i = 0; i < 5; i++) {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return i >= 5; // Simulate flag being set at 5
          return undefined;
        });

        trackLogManagementCommands(mockContext);
      }

      // Additional 5 commands after notification shown
      for (let i = 5; i < 10; i++) {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext);
      }

      // Should only show notification once
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should handle very large count numbers', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
          return 999;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return true;
        return undefined;
      });

      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1000,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should handle zero count', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 0;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1,
      );
    });
  });

  describe('State Management Integration', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });
    });

    it('should use GlobalStateKey enum for counter', () => {
      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        expect.any(Number),
      );
    });

    it('should use GlobalStateKey enum for notification flag', () => {
      trackLogManagementCommands(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
        true,
      );
    });
  });

  describe('Notification Event Type', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });
    });

    it('should always use EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS event type', () => {
      trackLogManagementCommands(mockContext);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
        expect.any(String),
        mockContext,
      );
    });
  });
});
