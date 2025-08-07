import { showFreshInstallWebView } from '@/releases/showReleaseHtmlWebView/showFreshInstallWebView';
import { writeToGlobalState } from '@/helpers';
import { getHtmlWebView as freshInstallHtmlWebView } from '@/releases/fresh-install';
import { openWebView } from '@/ui/helpers/';
import {
  createTelemetryService,
  type TurboAnalyticsProvider,
} from '@/telemetry';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers');
jest.mock('@/releases/fresh-install');
jest.mock('@/ui/helpers/');
jest.mock('@/telemetry');

describe('showFreshInstallWebView', () => {
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockFreshInstallHtmlWebView =
    freshInstallHtmlWebView as jest.MockedFunction<
      typeof freshInstallHtmlWebView
    >;
  const mockOpenWebView = openWebView as jest.MockedFunction<
    typeof openWebView
  >;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;

  let mockTelemetryService: jest.Mocked<TurboAnalyticsProvider>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock telemetry service
    mockTelemetryService = {
      reportFreshInstall: jest.fn(),
      reportUpdate: jest.fn(),
      dispose: jest.fn(),
    };
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

    mockFreshInstallHtmlWebView.mockReturnValue(
      '<html>Fresh install content</html>',
    );
  });

  it('should open web view with fresh install content and title', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockOpenWebView).toHaveBeenCalledWith(
      '🚀 Welcome To Turbo Console Log Family 🎊',
      '<html>Fresh install content</html>',
    );
  });

  it('should write notification shown flag to global state', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_3.5.0',
      true,
    );
  });

  it('should call functions in correct order', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockFreshInstallHtmlWebView).toHaveBeenCalledTimes(1);
    expect(mockOpenWebView).toHaveBeenCalledTimes(1);
    expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
  });
});
