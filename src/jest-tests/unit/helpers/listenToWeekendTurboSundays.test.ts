import { listenToWeekendTurboSundays } from '@/helpers/listenToWeekendTurboSundays';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import type { ExtensionContext } from 'vscode';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('listenToWeekendTurboSundays', () => {
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

  const testVersion = '3.14.1';
  let context: ExtensionContext;
  let originalGetDay: () => number;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Save original getDay method
    originalGetDay = Date.prototype.getDay;

    // Default mocks
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(undefined);
    mockShowNotification.mockResolvedValue(true);
  });

  afterEach(() => {
    // Restore original getDay method
    Date.prototype.getDay = originalGetDay;
  });

  describe('Pro user filtering', () => {
    it('should not show notification for Pro users', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      mockIsProUser.mockReturnValue(true);

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Already shown guard', () => {
    it('should not show notification when already shown', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      mockReadFromGlobalState.mockReturnValue(true); // Already shown

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should check correct global state key', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WEEKEND_TURBO_SUNDAYS_NOTIFICATION,
      );
    });
  });

  describe('Weekend detection', () => {
    it('should not show notification on Monday', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(1); // Monday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification on Tuesday', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(2); // Tuesday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification on Wednesday', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(3); // Wednesday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification on Thursday', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(4); // Thursday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not show notification on Friday', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(5); // Friday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should show notification on Saturday for free users', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WEEKEND_TURBO_SUNDAYS,
        testVersion,
        context,
      );
    });

    it('should show notification on Sunday for free users', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(0); // Sunday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WEEKEND_TURBO_SUNDAYS,
        testVersion,
        context,
      );
    });
  });

  describe('Notification success handling', () => {
    it('should mark as shown when notification is successfully displayed', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      mockShowNotification.mockResolvedValue(true); // Successfully shown

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WEEKEND_TURBO_SUNDAYS_NOTIFICATION,
        true,
      );
    });

    it('should call showNotification immediately during activation', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(0); // Sunday

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WEEKEND_TURBO_SUNDAYS,
        testVersion,
        context,
      );
    });
  });

  describe('Error handling', () => {
    it('should handle showNotification errors gracefully', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockShowNotification.mockRejectedValue(new Error('Network error'));

      await listenToWeekendTurboSundays(context, testVersion);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Turbo Console Log] Error showing weekend notification:',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });

    it('should not throw when showNotification rejects', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      jest.spyOn(console, 'error').mockImplementation();
      mockShowNotification.mockRejectedValue(new Error('Test error'));

      await expect(
        listenToWeekendTurboSundays(context, testVersion),
      ).resolves.not.toThrow();
    });
  });

  describe('Cooldown blocking behavior', () => {
    it('should not mark as shown when notification is blocked by cooldown', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WEEKEND_TURBO_SUNDAYS_NOTIFICATION,
        true,
      );
    });

    it('should allow retry on future weekends if blocked by cooldown', async () => {
      Date.prototype.getDay = jest.fn().mockReturnValue(6); // Saturday
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      await listenToWeekendTurboSundays(context, testVersion);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      // Notification can be attempted again next weekend since flag not set
    });
  });
});
