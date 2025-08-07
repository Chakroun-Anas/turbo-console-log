import { showLatestReleaseWebView } from '@/releases/showReleaseHtmlWebView/showLatestReleaseWebView';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { openWebView } from '@/ui';
import { releaseNotes } from '@/releases/releaseNotes';
import {
  createTelemetryService,
  type TurboAnalyticsProvider,
} from '@/telemetry';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';

jest.mock('@/helpers');
jest.mock('@/ui');
jest.mock('@/releases/releaseNotes');
jest.mock('@/telemetry');
jest.mock('vscode');

describe('showLatestReleaseWebView', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockOpenWebView = openWebView as jest.MockedFunction<
    typeof openWebView
  >;
  const mockReleaseNotes = releaseNotes as jest.Mocked<typeof releaseNotes>;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;
  const mockShowInformationMessage = vscode.window
    .showInformationMessage as jest.MockedFunction<
    typeof vscode.window.showInformationMessage
  >;
  const mockShowErrorMessage = vscode.window
    .showErrorMessage as jest.MockedFunction<
    typeof vscode.window.showErrorMessage
  >;
  const mockOpenExternal = vscode.env.openExternal as jest.MockedFunction<
    typeof vscode.env.openExternal
  >;
  const mockUriParse = vscode.Uri.parse as jest.MockedFunction<
    typeof vscode.Uri.parse
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

    // Mock showInformationMessage to return a resolved promise
    (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

    mockReleaseNotes['3.5.0'] = {
      webViewHtml: '<html>Release 3.5.0 content</html>',
      isPro: false,
    };
  });

  it('should not show notification if already shown', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(true); // Already shown

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_3.5.0',
    );
    expect(mockShowInformationMessage).not.toHaveBeenCalled();
    expect(mockOpenWebView).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
  });

  it('should show notification when not previously shown', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(false); // Not shown yet

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    expect(mockShowInformationMessage).toHaveBeenCalledWith(
      `🚀 Your time matters! We've adapted our release communication so we can get the most out of each other.`,
      'View Release Notes',
      'Later',
    );
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_3.5.0',
      true,
    );
  });

  it('should open webview when user clicks "View Release Notes"', async () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(false);
    (mockShowInformationMessage as jest.Mock).mockResolvedValue(
      'View Release Notes',
    );

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    // Wait for the promise to resolve
    await new Promise(process.nextTick);

    expect(mockOpenWebView).toHaveBeenCalledWith(
      '🚀 Turbo Console Log - Release 3.5.0 Notes',
      '<html>Release 3.5.0 content</html>',
    );
  });

  it('should open external URL when release has releaseArticleUrl', async () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(false);
    (mockShowInformationMessage as jest.Mock).mockResolvedValue(
      'View Release Notes',
    );

    // Mock release with external URL
    mockReleaseNotes['3.5.0'] = {
      webViewHtml: '<html>Release 3.5.0 content</html>',
      isPro: false,
      releaseArticleUrl: 'https://www.turboconsolelog.io/articles/release-350',
    };

    const mockUri = {
      toString: () => 'https://www.turboconsolelog.io/articles/release-350',
    } as vscode.Uri;
    mockUriParse.mockReturnValue(mockUri);

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    // Wait for the promise to resolve
    await new Promise(process.nextTick);

    expect(mockUriParse).toHaveBeenCalledWith(
      'https://www.turboconsolelog.io/articles/release-350',
    );
    expect(mockOpenExternal).toHaveBeenCalledWith(mockUri);
    expect(mockOpenWebView).not.toHaveBeenCalled();
  });

  it('should not open webview when user clicks "Later"', async () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(false);
    (mockShowInformationMessage as jest.Mock).mockResolvedValue('Later');

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    // Wait for the promise to resolve
    await new Promise(process.nextTick);

    expect(mockOpenWebView).not.toHaveBeenCalled();
  });

  it('should handle different version numbers correctly', () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '4.0.1';
    mockReleaseNotes['4.0.1'] = {
      webViewHtml: '<html>Release 4.0.1 content</html>',
      isPro: false,
    };
    mockReadFromGlobalState.mockReturnValue(false);

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_4.0.1',
    );
    expect(mockShowInformationMessage).toHaveBeenCalledWith(
      `🚀 Your time matters! We've adapted our release communication so we can get the most out of each other.`,
      'View Release Notes',
      'Later',
    );
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_4.0.1',
      true,
    );
  });

  it('should show error when neither releaseArticleUrl nor webViewHtml is available', async () => {
    const context = makeExtensionContext();
    const latestWebViewReleaseVersion = '3.5.0';
    mockReadFromGlobalState.mockReturnValue(false);
    (mockShowInformationMessage as jest.Mock).mockResolvedValue(
      'View Release Notes',
    );

    // Mock release with neither URL nor HTML
    mockReleaseNotes['3.5.0'] = {
      isPro: false,
      // No webViewHtml and no releaseArticleUrl
    };

    showLatestReleaseWebView(context, latestWebViewReleaseVersion);

    // Wait for the promise to resolve
    await new Promise(process.nextTick);

    expect(mockShowErrorMessage).toHaveBeenCalledWith(
      'Release notes for version 3.5.0 are not available.',
    );
    expect(mockOpenWebView).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
  });
});
