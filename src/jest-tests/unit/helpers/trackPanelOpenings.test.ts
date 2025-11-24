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
    it('should skip tracking if user already subscribed to newsletter', () => {
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
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        return undefined;
      });
    });

    it('should show notification at exactly 5 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 4;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        '3.0.0',
        context,
      );
    });

    it('should show notification at 15 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 14;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        '3.0.0',
        context,
      );
    });

    it('should show notification at 25 openings and mark milestone', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 24;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        '3.0.0',
        context,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION,
        true,
      );
    });

    it('should not show notification at 4 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 3;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification at 10 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 9;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification at 20 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 19;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification beyond 25 openings', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return true;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 29;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('should pass context to showNotification', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 4;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        '3.0.0',
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
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return false;
        }
        return undefined;
      });
    });

    it('should handle very large count numbers without showing notification', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return true;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 999;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification at count 100 (not a milestone)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
          return false;
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
        ) {
          return true;
        }
        if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
          return 99;
        }
        return undefined;
      });

      trackPanelOpenings(context);

      expect(mockShowNotification).not.toHaveBeenCalled();
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
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
          ) {
            return false;
          }
          if (key === GlobalStateKey.PANEL_OPENING_COUNT) {
            return i;
          }
          return undefined;
        });

        trackPanelOpenings(context);
      }

      // Notification should be shown at 5th opening only
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

      // Still only 1 notification shown (before subscribing)
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });

    it('should show notifications at 5, 15, and 25 openings only', () => {
      const notifications: number[] = [];

      for (let i = 0; i < 30; i++) {
        mockReadFromGlobalState.mockImplementation((ctx, key) => {
          if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
            return false;
          }
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
          ) {
            return i >= 25; // Milestone flag set at 25
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

      // Should show notifications only at 5, 15, and 25
      expect(notifications).toEqual([5, 15, 25]);
      expect(mockShowNotification).toHaveBeenCalledTimes(3);
    });

    it('should not show notifications after 25 milestone is reached', () => {
      const notifications: number[] = [];

      // Simulate opening panel 40 times
      for (let i = 0; i < 40; i++) {
        mockReadFromGlobalState.mockImplementation((ctx, key) => {
          if (key === GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER) {
            return false;
          }
          if (
            key ===
            GlobalStateKey.HAS_SHOWN_TWENTY_FIVE_PANEL_OPENINGS_NOTIFICATION
          ) {
            return i >= 25; // Milestone flag set at 25
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

      // Should only show 3 notifications (at 5, 15, 25)
      expect(notifications).toEqual([5, 15, 25]);
      expect(mockShowNotification).toHaveBeenCalledTimes(3);
    });
  });
});
