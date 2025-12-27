import * as vscode from 'vscode';
import { trackLogInsertions } from '@/helpers/trackLogInsertions';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
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
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
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

    it('should not show milestone notifications when count is less than 10 (but v3.11.0 launch already shown)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
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
        if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockShowNotification).not.toHaveBeenCalled();
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

        // Should only have one call (incrementing counter)
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          10,
        );
      });
    });

    describe('when user has already seen ten inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 20;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true;
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
          21,
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

        // Should only have one call (incrementing counter)
        expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'COMMAND_USAGE_COUNT',
          50,
        );
      });
    });

    describe('when user has already seen fifty inserts notification', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'COMMAND_USAGE_COUNT') return 60;
          if (key === 'HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION')
            return true; // Already shown
          if (key === 'HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION')
            return true;
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
  });
});
