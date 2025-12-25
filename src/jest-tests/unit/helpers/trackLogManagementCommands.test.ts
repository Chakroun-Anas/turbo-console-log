import * as vscode from 'vscode';
import {
  trackLogManagementCommands,
  LogManagementCommandType,
} from '@/helpers/trackLogManagementCommands';
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
      mockReadFromGlobalState.mockImplementation((_, key) => {
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
      trackLogManagementCommands(mockContext, 'comment');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        4,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification even at 5 commands milestone', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4; // Will become 5
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext, 'uncomment');

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

    it('should track command-specific counts but not show notifications', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4;
        if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT) return 4;
        return false;
      });

      trackLogManagementCommands(mockContext, 'delete');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        5,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.DELETE_COMMAND_USAGE_COUNT,
        5,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('when user is a free user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should increment command usage count', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 2;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        3,
      );
    });

    it('should handle undefined counter (first use)', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      trackLogManagementCommands(mockContext, 'delete');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1,
      );
    });

    describe('when reaching 5 commands milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
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
        trackLogManagementCommands(mockContext, 'comment');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
          '3.0.0',
          mockContext,
        );
      });

      it('should mark notification as shown', () => {
        trackLogManagementCommands(mockContext, 'delete');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
          true,
        );
      });

      it('should call writeToGlobalState in correct order', () => {
        const callOrder: string[] = [];

        mockWriteToGlobalState.mockImplementation((_, key) => {
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

        trackLogManagementCommands(mockContext, 'comment');

        expect(callOrder).toEqual(['increment-counter', 'mark-as-shown']);
      });
    });

    describe('when notification has already been shown', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
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
        trackLogManagementCommands(mockContext, 'comment');

        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should still increment counter', () => {
        trackLogManagementCommands(mockContext, 'uncomment');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          5,
        );
      });
    });

    describe('when beyond 5 commands', () => {
      it('should not show notification at 6 commands', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 5; // Will become 6
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'correct');

        expect(mockShowNotification).not.toHaveBeenCalled();
      });

      it('should not show notification at 10 commands', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9; // Will become 10
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'comment');

        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('Extension Version', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((_, key) => {
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
      trackLogManagementCommands(mockContext, 'uncomment');

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
        '3.0.0',
        mockContext,
      );
    });

    it('should pass context to showNotification', () => {
      trackLogManagementCommands(mockContext, 'delete');

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
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'comment');
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
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return i >= 5; // Simulate flag being set at 5
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'uncomment');
      }

      // Additional 5 commands after notification shown
      for (let i = 5; i < 10; i++) {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return i;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'delete');
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
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
          return 999;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return true;
        return undefined;
      });

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1000,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should handle zero count', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 0;
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
        )
          return false;
        return undefined;
      });

      trackLogManagementCommands(mockContext, 'uncomment');

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
      mockReadFromGlobalState.mockImplementation((_, key) => {
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
      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        expect.any(Number),
      );
    });

    it('should use GlobalStateKey enum for notification flag', () => {
      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
        true,
      );
    });
  });

  describe('Command-specific tracking', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    describe('comment command tracking', () => {
      it('should increment both general and comment-specific counters', () => {
        mockReadFromGlobalState.mockReturnValue(0);

        trackLogManagementCommands(mockContext, 'comment');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT,
          1,
        );
      });

      it('should show comment-specific notification when reaching 5 uses and general already shown', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9;
          if (key === GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT) return 4;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true; // General already shown
          if (
            key === GlobalStateKey.HAS_SHOWN_FIVE_COMMENTS_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'comment');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS,
          '3.0.0',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_COMMENTS_COMMANDS_NOTIFICATION,
          true,
        );
      });

      it('should show general notification first when both general and comment reach 5 simultaneously', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 4; // Will become 5
          if (key === GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT) return 4; // Will become 5
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return false;
          if (
            key === GlobalStateKey.HAS_SHOWN_FIVE_COMMENTS_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'comment');

        // Should show general notification, not comment-specific
        expect(mockShowNotification).toHaveBeenCalledTimes(1);
        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
          '3.0.0',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION,
          true,
        );
      });
    });

    describe('uncomment command tracking', () => {
      it('should show uncomment-specific notification at 5 uses', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9;
          if (key === GlobalStateKey.UNCOMMENT_COMMAND_USAGE_COUNT) return 4;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_UNCOMMENTS_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'uncomment');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS,
          '3.0.0',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_UNCOMMENTS_COMMANDS_NOTIFICATION,
          true,
        );
      });
    });

    describe('delete command tracking', () => {
      it('should show delete-specific notification at 5 uses', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9;
          if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT) return 4;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          if (
            key === GlobalStateKey.HAS_SHOWN_FIVE_DELETE_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'delete');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
          '3.0.0',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_DELETE_COMMANDS_NOTIFICATION,
          true,
        );
      });
    });

    describe('correct command tracking', () => {
      it('should show correction-specific notification at 5 uses', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9;
          if (key === GlobalStateKey.CORRECTION_COMMAND_USAGE_COUNT) return 4;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_CORRECTIONS_COMMANDS_NOTIFICATION
          )
            return false;
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'correct');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS,
          '3.0.0',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_FIVE_CORRECTIONS_COMMANDS_NOTIFICATION,
          true,
        );
      });
    });

    describe('notification priority scenarios', () => {
      it('should show specific notification after general notification was shown', () => {
        // Simulate: user did 5 mixed commands, general notification shown
        // User continues with delete commands, now reaching 5 deletes total
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9; // Well past general threshold
          if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT) return 4; // Will become 5
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true; // General already shown
          if (
            key === GlobalStateKey.HAS_SHOWN_FIVE_DELETE_COMMANDS_NOTIFICATION
          )
            return false; // Delete-specific not shown yet
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'delete');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS,
          '3.0.0',
          mockContext,
        );
      });

      it('should not show specific notification again if already shown', () => {
        mockReadFromGlobalState.mockImplementation((_, key) => {
          if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
            return 9;
          if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT) return 5; // Already at 5
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_FIVE_LOG_MANAGEMENT_COMMANDS_NOTIFICATION
          )
            return true;
          if (
            key === GlobalStateKey.HAS_SHOWN_FIVE_DELETE_COMMANDS_NOTIFICATION
          )
            return true; // Already shown
          return undefined;
        });

        trackLogManagementCommands(mockContext, 'delete');

        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });

    describe('mixed command usage patterns', () => {
      it('should handle user doing mix of commands before reaching any milestone', () => {
        const commandSequence: LogManagementCommandType[] = [
          'comment',
          'delete',
          'uncomment',
          'comment',
        ];

        commandSequence.forEach((cmd, index) => {
          mockReadFromGlobalState.mockImplementation((_, key) => {
            if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT)
              return index;
            // All command-specific counts are low
            if (key === GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT)
              return cmd === 'comment' ? 1 : 0;
            if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT)
              return cmd === 'delete' ? 0 : 0;
            if (key === GlobalStateKey.UNCOMMENT_COMMAND_USAGE_COUNT)
              return cmd === 'uncomment' ? 0 : 0;
            return false;
          });

          trackLogManagementCommands(mockContext, cmd);
        });

        // No notifications should be shown yet
        expect(mockShowNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('Notification Event Type', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((_, key) => {
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
      trackLogManagementCommands(mockContext, 'comment');

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS,
        expect.any(String),
        mockContext,
      );
    });
  });
});
