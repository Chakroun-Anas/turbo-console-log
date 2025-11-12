import * as vscode from 'vscode';
import { checkPendingNotifications } from '@/helpers/checkPendingNotifications';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('checkPendingNotifications', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('when pending ten inserts notification flag is true', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION) {
          return true;
        }
        return undefined;
      });
    });

    it('should clear the pending flag', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION,
        false,
      );
    });

    it('should mark ten inserts notification as shown', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    });

    it('should show ten inserts notification with version', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_TEN_INSERTS,
        version,
        mockContext,
      );
    });

    it('should show notification with undefined version when version not provided', () => {
      checkPendingNotifications(mockContext);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_TEN_INSERTS,
        undefined,
        mockContext,
      );
    });

    it('should execute all steps in correct order', () => {
      const version = '3.9.5';
      const callOrder: string[] = [];

      mockWriteToGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION) {
          callOrder.push('clear-pending-flag');
        }
        if (
          key === GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION
        ) {
          callOrder.push('mark-as-shown');
        }
      });

      mockShowNotification.mockImplementation(async () => {
        callOrder.push('show-notification');
      });

      checkPendingNotifications(mockContext, version);

      expect(callOrder).toEqual([
        'clear-pending-flag',
        'mark-as-shown',
        'show-notification',
      ]);
    });

    it('should work correctly with different version formats', () => {
      const versions = ['3.9.5', '3.10.0', '4.0.0', '3.9.5-beta'];

      versions.forEach((version) => {
        jest.clearAllMocks();
        mockReadFromGlobalState.mockReturnValue(true);

        checkPendingNotifications(mockContext, version);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_TEN_INSERTS,
          version,
          mockContext,
        );
      });
    });
  });

  describe('when pending ten inserts notification flag is false', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION) {
          return false;
        }
        return undefined;
      });
    });

    it('should not clear any flags', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('should not show notification', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not mark notification as shown', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    });
  });

  describe('when pending ten inserts notification flag is undefined', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockReturnValue(undefined);
    });

    it('should not perform any actions', () => {
      const version = '3.9.5';

      checkPendingNotifications(mockContext, version);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should handle missing version gracefully', () => {
      checkPendingNotifications(mockContext);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple consecutive calls correctly', () => {
      // Mock only ten inserts pending (not PHP)
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION) {
          return true;
        }
        return false;
      });
      const version = '3.9.5';

      // First call should show notification
      checkPendingNotifications(mockContext, version);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Simulate flag being cleared (as it would be in real scenario)
      mockReadFromGlobalState.mockReturnValue(false);
      jest.clearAllMocks();

      // Second call should not show notification
      checkPendingNotifications(mockContext, version);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should handle context with minimal state', () => {
      const minimalContext = {
        globalState: {
          get: jest.fn().mockReturnValue(true),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      mockReadFromGlobalState.mockReturnValue(true);

      expect(() => {
        checkPendingNotifications(minimalContext, '3.9.5');
      }).not.toThrow();
    });

    it('should be synchronous and return void', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      const result = checkPendingNotifications(mockContext, '3.9.5');

      expect(result).toBeUndefined();
      expect(typeof result).toBe('undefined');
    });
  });

  describe('integration with GlobalStateKey enum', () => {
    it('should use correct GlobalStateKey constants', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      checkPendingNotifications(mockContext, '3.9.5');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION,
      );

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.PENDING_TEN_INSERTS_NOTIFICATION,
        false,
      );

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    });
  });

  describe('notification event type', () => {
    it('should always use EXTENSION_TEN_INSERTS event type', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      checkPendingNotifications(mockContext, '3.9.5');

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_TEN_INSERTS,
        expect.any(String),
        expect.any(Object),
      );
    });

    it('should not use other notification event types', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      checkPendingNotifications(mockContext, '3.9.5');

      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FIFTY_INSERTS,
        expect.anything(),
        expect.anything(),
      );

      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('PHP workspace pending notification', () => {
    it('should clear pending flag when PHP notification is pending', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        return key === GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION;
      });

      checkPendingNotifications(mockContext, '3.9.6');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION,
        false,
      );
    });

    it('should show PHP workspace notification when pending', () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        return key === GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION;
      });
      const version = '3.9.6';

      checkPendingNotifications(mockContext, version);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
        version,
        mockContext,
      );
    });

    it('should not show PHP notification when flag is false', () => {
      mockReadFromGlobalState.mockReturnValue(false);

      checkPendingNotifications(mockContext, '3.9.6');

      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
        expect.anything(),
        expect.anything(),
      );
    });

    it('should handle both pending notifications independently', () => {
      // Both notifications pending
      mockReadFromGlobalState.mockReturnValue(true);
      const version = '3.9.6';

      checkPendingNotifications(mockContext, version);

      // Should show both notifications
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_TEN_INSERTS,
        version,
        mockContext,
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
        version,
        mockContext,
      );
      expect(mockShowNotification).toHaveBeenCalledTimes(2);
    });
  });
});
