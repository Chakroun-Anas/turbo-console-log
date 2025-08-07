import { showReleaseHtmlWebView } from '@/releases/showReleaseHtmlWebView/showReleaseHtmlWebView';
import { readFromGlobalState } from '@/helpers';
import { showFreshInstallWebView } from '@/releases/showReleaseHtmlWebView/showFreshInstallWebView';
import { showLatestReleaseWebView } from '@/releases/showReleaseHtmlWebView/showLatestReleaseWebView';
import { isCurrentTimeWithinReleaseReviewWindow } from '@/releases/showReleaseHtmlWebView/isCurrentTimeWithinReleaseReviewWindow';
import { targetWindowDate } from '@/releases/showReleaseHtmlWebView/targetWindowDate';
import {
  createTelemetryService,
  type TurboAnalyticsProvider,
} from '@/telemetry';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';

jest.mock('@/helpers');
jest.mock('@/releases/showReleaseHtmlWebView/showFreshInstallWebView');
jest.mock('@/releases/showReleaseHtmlWebView/showLatestReleaseWebView');
jest.mock(
  '@/releases/showReleaseHtmlWebView/isCurrentTimeWithinReleaseReviewWindow',
);
jest.mock('@/releases/showReleaseHtmlWebView/targetWindowDate');
jest.mock('@/telemetry');

describe('showReleaseHtmlWebView', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockShowFreshInstallWebView =
    showFreshInstallWebView as jest.MockedFunction<
      typeof showFreshInstallWebView
    >;
  const mockShowLatestReleaseWebView =
    showLatestReleaseWebView as jest.MockedFunction<
      typeof showLatestReleaseWebView
    >;
  const mockIsCurrentTimeWithinReleaseReviewWindow =
    isCurrentTimeWithinReleaseReviewWindow as jest.MockedFunction<
      typeof isCurrentTimeWithinReleaseReviewWindow
    >;
  const mockTargetWindowDate = targetWindowDate as jest.MockedFunction<
    typeof targetWindowDate
  >;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;

  let context: ReturnType<typeof makeExtensionContext>;
  let mockTelemetryService: jest.Mocked<TurboAnalyticsProvider>;
  const previousWebViewReleaseVersion = '3.4.0';
  const latestWebViewReleaseVersion = '3.5.0';
  const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
    'Morning';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Create mock telemetry service
    mockTelemetryService = {
      reportFreshInstall: jest.fn(),
      reportUpdate: jest.fn(),
      dispose: jest.fn(),
    };
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

    context = makeExtensionContext();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Fresh install scenario', () => {
    it('should show fresh install web view when neither previous nor latest release webview was shown', () => {
      mockReadFromGlobalState
        .mockReturnValueOnce(false) // Previous not shown
        .mockReturnValueOnce(false); // Latest not shown

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        new Date(),
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockReadFromGlobalState).toHaveBeenCalledTimes(2);
      expect(mockReadFromGlobalState).toHaveBeenNthCalledWith(
        1,
        context,
        'IS_NOTIFICATION_SHOWN_3.4.0',
      );
      expect(mockReadFromGlobalState).toHaveBeenNthCalledWith(
        2,
        context,
        'IS_NOTIFICATION_SHOWN_3.5.0',
      );
      expect(mockShowFreshInstallWebView).toHaveBeenCalledWith(
        context,
        latestWebViewReleaseVersion,
      );
      expect(mockShowLatestReleaseWebView).not.toHaveBeenCalled();
    });
  });

  describe('Existing user update scenario', () => {
    beforeEach(() => {
      // Previous release was shown, latest was not (typical update scenario)
      mockReadFromGlobalState
        .mockReturnValueOnce(true) // Previous shown
        .mockReturnValueOnce(false); // Latest not shown
    });

    it('should show latest release web view immediately when within target window', () => {
      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(true);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        new Date(),
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockIsCurrentTimeWithinReleaseReviewWindow).toHaveBeenCalledWith(
        releaseReviewTargetWindow,
      );
      expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
        context,
        latestWebViewReleaseVersion,
      );
      expect(mockTargetWindowDate).not.toHaveBeenCalled();
    });

    it('should schedule web view for later when outside target window', () => {
      const currentTime = new Date(2025, 0, 15, 10, 0, 0); // 10:00 AM
      const targetDate = new Date(2025, 0, 15, 16, 0, 0); // 4:00 PM (6 hours later)
      const expectedDelay = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockTargetWindowDate).toHaveBeenCalledWith(
        releaseReviewTargetWindow,
      );
      expect(mockShowLatestReleaseWebView).not.toHaveBeenCalled(); // Not called immediately

      // Fast-forward time to trigger the timeout
      jest.advanceTimersByTime(expectedDelay);

      expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
        context,
        latestWebViewReleaseVersion,
      );
    });

    it('should add timeout to context subscriptions for cleanup', () => {
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);
      const targetDate = new Date(2025, 0, 15, 16, 0, 0);

      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(context.subscriptions).toHaveLength(1);
      expect(context.subscriptions[0]).toHaveProperty('dispose');
      expect(typeof context.subscriptions[0].dispose).toBe('function');
    });

    it('should not schedule web view if target date is in the past', () => {
      const currentTime = new Date(2025, 0, 15, 16, 0, 0); // 4:00 PM
      const targetDate = new Date(2025, 0, 15, 10, 0, 0); // 10:00 AM (6 hours earlier)

      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockTargetWindowDate).toHaveBeenCalledWith(
        releaseReviewTargetWindow,
      );
      expect(context.subscriptions).toHaveLength(0); // No timeout added
      expect(mockShowLatestReleaseWebView).not.toHaveBeenCalled();
    });

    it('should pass currentTime parameter to targetWindowDate when provided', () => {
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);
      const targetDate = new Date(2025, 0, 15, 16, 0, 0);

      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockTargetWindowDate).toHaveBeenCalledWith(
        releaseReviewTargetWindow,
      );
    });

    it('should work with different target windows', () => {
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);
      const targetDate = new Date(2025, 0, 15, 21, 0, 0); // 9:00 PM
      const eveningWindow: ExtensionProperties['releaseReviewTargetWindow'] =
        'Evening';

      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        eveningWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockIsCurrentTimeWithinReleaseReviewWindow).toHaveBeenCalledWith(
        eveningWindow,
      );
      expect(mockTargetWindowDate).toHaveBeenCalledWith(eveningWindow);
    });
  });

  describe('Already shown scenario', () => {
    it('should do nothing when latest release webview was already shown', () => {
      mockReadFromGlobalState
        .mockReturnValueOnce(true) // Previous shown
        .mockReturnValueOnce(true); // Latest also shown

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        new Date(),
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(mockShowFreshInstallWebView).not.toHaveBeenCalled();
      expect(mockShowLatestReleaseWebView).not.toHaveBeenCalled();
      expect(mockIsCurrentTimeWithinReleaseReviewWindow).not.toHaveBeenCalled();
      expect(mockTargetWindowDate).not.toHaveBeenCalled();
    });
  });

  describe('Past seven days scenarios', () => {
    beforeEach(() => {
      // Previous release was shown, latest was not (typical update scenario)
      mockReadFromGlobalState
        .mockReturnValueOnce(true) // Previous shown
        .mockReturnValueOnce(false); // Latest not shown
    });

    describe('When release is past 7 days', () => {
      it('should show latest release immediately when currently in additional target window', () => {
        const currentTime = new Date(2025, 0, 15, 14, 30, 0); // Afternoon time
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Morning';

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in original Morning window
          .mockReturnValueOnce(true); // Currently in Afternoon (additional) window

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenCalledTimes(2);
        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenNthCalledWith(1, 'Morning');
        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenNthCalledWith(2, 'Afternoon', currentTime);
        expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
          context,
          latestWebViewReleaseVersion,
        );
        expect(mockTargetWindowDate).not.toHaveBeenCalled(); // Should not schedule timeout
      });

      it('should schedule for the earliest available window (original vs additional)', () => {
        const currentTime = new Date(2025, 0, 15, 18, 0, 0); // 6 PM - outside both windows
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Morning';

        const nextMorning = new Date(2025, 0, 16, 7, 0, 0); // Tomorrow 7 AM
        const nextAfternoon = new Date(2025, 0, 16, 13, 0, 0); // Tomorrow 1 PM

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in original Morning window
          .mockReturnValueOnce(false); // Not in Afternoon (additional) window
        mockTargetWindowDate
          .mockReturnValueOnce(nextMorning) // Original target date (Morning)
          .mockReturnValueOnce(nextAfternoon); // Additional target date (Afternoon)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(mockTargetWindowDate).toHaveBeenCalledWith(
          'Morning',
          currentTime,
        );
        expect(mockTargetWindowDate).toHaveBeenCalledWith(
          'Afternoon',
          currentTime,
        );

        // Should pick Morning (7 AM) since it's earlier than Afternoon (1 PM)
        const expectedDeltaTime = nextMorning.getTime() - currentTime.getTime();
        jest.advanceTimersByTime(expectedDeltaTime);
        expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
          context,
          latestWebViewReleaseVersion,
        );

        // Should have scheduled timeout
        expect(context.subscriptions).toHaveLength(1);
      });

      it('should schedule for additional window when it comes before original window', () => {
        const currentTime = new Date(2025, 0, 15, 22, 0, 0); // 10 PM - late night
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Afternoon';

        const nextAfternoon = new Date(2025, 0, 16, 13, 0, 0); // Tomorrow 1 PM
        const nextEvening = new Date(2025, 0, 16, 17, 0, 0); // Tomorrow 5 PM (additional)

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in original Afternoon window
          .mockReturnValueOnce(false); // Not in Evening (additional) window
        mockTargetWindowDate
          .mockReturnValueOnce(nextAfternoon) // Original target date (Afternoon)
          .mockReturnValueOnce(nextEvening); // Additional target date (Evening)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        // Should pick Afternoon (1 PM) since it's earlier than Evening (5 PM)
        const expectedDeltaTime =
          nextAfternoon.getTime() - currentTime.getTime();
        jest.advanceTimersByTime(expectedDeltaTime);
        expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
          context,
          latestWebViewReleaseVersion,
        );

        // Should have scheduled timeout
        expect(context.subscriptions).toHaveLength(1);
      });

      it('should schedule for additional window when original window date is later', () => {
        const currentTime = new Date(2025, 0, 15, 10, 0, 0); // 10 AM
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Night';

        // Night window is 9 PM - 2 AM, so next Night is today 9 PM
        // Additional window for Night is Evening (5 PM - 9 PM), so next Evening is today 5 PM
        const nextNight = new Date(2025, 0, 15, 21, 0, 0); // Today 9 PM (Night)
        const nextEvening = new Date(2025, 0, 15, 17, 0, 0); // Today 5 PM (Evening - additional)

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in original Night window
          .mockReturnValueOnce(false); // Not in Evening (additional) window
        mockTargetWindowDate
          .mockReturnValueOnce(nextNight) // Original target date (Night)
          .mockReturnValueOnce(nextEvening); // Additional target date (Evening)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        // Should pick Evening (5 PM) since it's earlier than Night (9 PM)
        const expectedDeltaTime = nextEvening.getTime() - currentTime.getTime();
        jest.advanceTimersByTime(expectedDeltaTime);
        expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
          context,
          latestWebViewReleaseVersion,
        );

        // Should have scheduled timeout
        expect(context.subscriptions).toHaveLength(1);
      });

      it('should not schedule timeout if delta time is negative or zero', () => {
        const currentTime = new Date(2025, 0, 15, 8, 0, 0); // 8 AM
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Morning';

        const pastMorning = new Date(2025, 0, 15, 7, 0, 0); // This morning 7 AM (already passed)
        const pastAfternoon = new Date(2025, 0, 14, 13, 0, 0); // Yesterday 1 PM (already passed)

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in original Morning window
          .mockReturnValueOnce(false); // Not in Afternoon (additional) window
        mockTargetWindowDate
          .mockReturnValueOnce(pastMorning) // Original target date (past)
          .mockReturnValueOnce(pastAfternoon); // Additional target date (past)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(context.subscriptions).toHaveLength(0); // No timeout scheduled
        expect(mockShowLatestReleaseWebView).not.toHaveBeenCalled();
      });

      it('should properly dispose timeout for past seven days scenario', () => {
        const currentTime = new Date(2025, 0, 15, 18, 0, 0); // 6 PM
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const nextMorning = new Date(2025, 0, 16, 7, 0, 0); // Tomorrow 7 AM
        const nextAfternoon = new Date(2025, 0, 16, 13, 0, 0); // Tomorrow 1 PM

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false);
        mockTargetWindowDate
          .mockReturnValueOnce(nextMorning)
          .mockReturnValueOnce(nextAfternoon);

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(context.subscriptions).toHaveLength(1);
        expect(context.subscriptions[0]).toHaveProperty('dispose');
        expect(typeof context.subscriptions[0].dispose).toBe('function');

        // Test the dispose function
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
        context.subscriptions[0].dispose();
        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
      });
    });

    describe('When release is not past 7 days', () => {
      it('should fall through to original scheduling logic when release is recent', () => {
        const currentTime = new Date(2025, 0, 15, 18, 0, 0); // 6 PM
        const releaseDate = new Date(2025, 0, 12); // Only 3 days ago
        const targetDate = new Date(2025, 0, 16, 7, 0, 0); // Tomorrow 7 AM

        mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
        mockTargetWindowDate.mockReturnValue(targetDate);

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        // Should call original target window logic (not past 7 days logic)
        expect(mockTargetWindowDate).toHaveBeenCalledWith('Morning'); // Note: no currentTime parameter

        // Should advance time and trigger callback
        const expectedDeltaTime = targetDate.getTime() - currentTime.getTime();
        jest.advanceTimersByTime(expectedDeltaTime);
        expect(mockShowLatestReleaseWebView).toHaveBeenCalledWith(
          context,
          latestWebViewReleaseVersion,
        );

        // Should have scheduled timeout
        expect(context.subscriptions).toHaveLength(1);
      });
    });

    describe('Integration with additionalTargetWindow function', () => {
      it('should correctly get additional window for Morning target', () => {
        const currentTime = new Date(2025, 0, 15, 14, 30, 0);
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Morning';

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in Morning
          .mockReturnValueOnce(true); // In Afternoon (additional for Morning)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenNthCalledWith(2, 'Afternoon', currentTime);
      });

      it('should correctly get additional window for Evening target', () => {
        const currentTime = new Date(2025, 0, 15, 22, 30, 0); // 10:30 PM
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Evening';

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in Evening
          .mockReturnValueOnce(true); // In Night (additional for Evening)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenNthCalledWith(2, 'Night', currentTime);
      });

      it('should correctly get additional window for Night target (wraps to Evening)', () => {
        const currentTime = new Date(2025, 0, 15, 18, 30, 0); // 6:30 PM
        const releaseDate = new Date(2025, 0, 7); // 8 days ago
        const releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'] =
          'Night';

        mockIsCurrentTimeWithinReleaseReviewWindow
          .mockReturnValueOnce(false) // Not in Night
          .mockReturnValueOnce(true); // In Evening (additional for Night)

        showReleaseHtmlWebView(
          context,
          previousWebViewReleaseVersion,
          latestWebViewReleaseVersion,
          releaseReviewTargetWindow,
          currentTime,
          releaseDate,
        );

        expect(
          mockIsCurrentTimeWithinReleaseReviewWindow,
        ).toHaveBeenNthCalledWith(2, 'Evening', currentTime);
      });
    });
  });

  describe('Timeout disposal', () => {
    it('should properly dispose timeout when context is disposed', () => {
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);
      const targetDate = new Date(2025, 0, 15, 16, 0, 0);

      mockReadFromGlobalState
        .mockReturnValueOnce(true) // Previous shown
        .mockReturnValueOnce(false); // Latest not shown
      mockIsCurrentTimeWithinReleaseReviewWindow.mockReturnValue(false);
      mockTargetWindowDate.mockReturnValue(targetDate);

      showReleaseHtmlWebView(
        context,
        previousWebViewReleaseVersion,
        latestWebViewReleaseVersion,
        releaseReviewTargetWindow,
        currentTime,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      );

      expect(context.subscriptions).toHaveLength(1);

      // Dispose the timeout
      const disposable = context.subscriptions[0];
      const result = disposable.dispose();

      // Should return the clearTimeout result (typically undefined)
      expect(result).toBeUndefined();
    });
  });
});
