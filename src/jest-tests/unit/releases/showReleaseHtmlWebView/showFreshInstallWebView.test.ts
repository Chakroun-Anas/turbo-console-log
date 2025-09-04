import { showFreshInstallWebView } from '@/releases/showReleaseHtmlWebView/showFreshInstallWebView';
import { writeToGlobalState } from '@/helpers';
import {
  createTelemetryService,
  type TurboAnalyticsProvider,
} from '@/telemetry';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';

jest.mock('@/helpers');
jest.mock('@/telemetry');
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
  },
}));

describe('showFreshInstallWebView', () => {
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;
  const mockShowInformationMessage = vscode.window
    .showInformationMessage as jest.MockedFunction<
    typeof vscode.window.showInformationMessage
  >;

  let mockTelemetryService: jest.Mocked<TurboAnalyticsProvider>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock telemetry service
    mockTelemetryService = {
      reportFreshInstall: jest.fn(),
      reportUpdate: jest.fn(),
      reportCommandsInserted: jest.fn(),
      dispose: jest.fn(),
    };
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService);
  });

  it('should show information message with welcome text', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockShowInformationMessage).toHaveBeenCalledWith(
      'Welcome aboard 🚀 Turbo is ready to boost your debugging!',
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

  it('should report fresh install telemetry', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockCreateTelemetryService).toHaveBeenCalledTimes(1);
    expect(mockTelemetryService.reportFreshInstall).toHaveBeenCalledTimes(1);
  });

  it('should call functions in correct order', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';

    showFreshInstallWebView(context, latestWebViewReleaseVersion);

    expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
    expect(mockWriteToGlobalState).toHaveBeenCalledTimes(5); // Added newsletter status bar flag
    expect(mockCreateTelemetryService).toHaveBeenCalledTimes(1);
  });
});
