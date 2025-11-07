import * as vscode from 'vscode';
import { trackPanelOpenings } from '@/helpers/trackPanelOpenings';
import { readFromGlobalState, writeToGlobalState } from '@/helpers/index';
import { GlobalStateKey } from '@/entities';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock dependencies
jest.mock('@/helpers/index');
jest.mock('@/notifications/showNotification');

const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

describe('trackPanelOpenings', () => {
  let context: vscode.ExtensionContext;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Default mock implementations
    mockReadFromGlobalState.mockReturnValue(undefined);
    mockShowNotification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Newsletter Subscription Check', () => {
    it('should skip notification if user already subscribed to newsletter', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return true;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      // Should not increment counter or show notification
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should continue tracking if user has not subscribed to newsletter', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 9;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      // Should increment counter
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        10,
      );
    });

    it('should continue tracking if newsletter subscription state is undefined', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 5;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      // Should increment counter
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        6,
      );
    });
  });

  describe('Panel Opening Count Tracking', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        return undefined;
      });
    });

    it('should initialize count to 1 when no previous count exists', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return undefined;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1,
      );
    });

    it('should increment existing count', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 5;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        6,
      );
    });

    it('should handle count of 0 correctly', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 0;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1,
      );
    });

    it('should increment panel opening count correctly', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 7;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        8,
      );
    });
  });

  describe('Notification Triggering', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        return undefined;
      });
    });

    it('should show notification at exactly 10 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 9;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        context,
      );
    });

    it('should show notification at 20 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 19;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        context,
      );
    });

    it('should show notification at 30 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 29;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        context,
      );
    });

    it('should not show notification at 9 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 8;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification at 11 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 10;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification at 15 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 14;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should pass context to showNotification', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 9;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        context,
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        return undefined;
      });
    });

    it('should handle very large count numbers', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 999;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1000,
      );
      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should handle count at 100 (multiple of 10)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 99;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        context,
      );
    });
  });

  describe('State Management Integration', () => {
    it('should read subscription state from correct global state key', () => {
      trackPanelOpenings(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER,
      );
    });

    it('should read panel count from correct global state key', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
      );
    });

    it('should write updated count to correct global state key', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 5;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        6,
      );
    });
  });

  describe('Complete User Journey Scenarios', () => {
    it('should handle user who opens panel, gets notified, and subscribes', () => {
      // First 10 openings - user hasn't subscribed yet
      for (let i = 0; i < 10; i++) {
        mockReadFromGlobalState.mockImplementation((ctx, key) => {
          if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
            return false;
          }
          if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
            return i;
          }
          return undefined;
        });

        trackPanelOpenings(context);
      }

      // Notification should be shown at 10th opening
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // User subscribes (sets flag to true)
      // Further openings should not show notification
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return true;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      // Still only 1 notification shown
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });

    it('should continue showing notifications every 10 opens if user has not subscribed', () => {
      const notifications: number[] = [];

      for (let i = 0; i < 35; i++) {
        mockReadFromGlobalState.mockImplementation((ctx, key) => {
          if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
            return false;
          }
          if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
            return i;
          }
          return undefined;
        });

        trackPanelOpenings(context);

        if (mockShowNotification.mock.calls.length > notifications.length) {
          notifications.push(i + 1);
        }
      }

      // Should show notifications at 10, 20, 30
      expect(notifications).toEqual([10, 20, 30]);
      expect(mockShowNotification).toHaveBeenCalledTimes(3);
    });
  });
});
