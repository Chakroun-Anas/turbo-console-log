import { showLatestReleaseWebView } from '@/releases/showReleaseHtmlWebView/showLatestReleaseWebView';
import {
  readFromGlobalState,
  writeToGlobalState,
  showReleaseStatusBar,
} from '@/helpers';
import { openWebView } from '@/ui/helpers/openWebView';
import { createTelemetryService } from '@/telemetry';
import * as vscode from 'vscode';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import type { ExtensionContext } from 'vscode';

// Mock dependencies
jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/helpers/showReleaseStatusBar');
jest.mock('@/ui/helpers/openWebView');
jest.mock('@/telemetry');

const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockShowReleaseStatusBar = showReleaseStatusBar as jest.MockedFunction<
  typeof showReleaseStatusBar
>;
const mockOpenWebView = openWebView as jest.MockedFunction<typeof openWebView>;
const mockCreateTelemetryService =
  createTelemetryService as jest.MockedFunction<typeof createTelemetryService>;

describe('showLatestReleaseWebView', () => {
  let mockContext: ExtensionContext;
  let mockShowInformationMessage: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // ⛔ Silence console.warn

    mockContext = makeExtensionContext();

    // Mock VS Code API
    mockShowInformationMessage = jest
      .spyOn(vscode.window, 'showInformationMessage')
      .mockResolvedValue(undefined);

    // Mock helper functions to return false for already shown notification
    mockReadFromGlobalState.mockReturnValue(false);
    mockWriteToGlobalState.mockReturnValue(undefined);
    mockShowReleaseStatusBar.mockReturnValue(undefined);
    mockOpenWebView.mockReturnValue(undefined);
    mockCreateTelemetryService.mockReturnValue({
      reportUpdate: jest.fn(),
      reportFreshInstall: jest.fn(),
      reportCommandsInserted: jest.fn(),
      dispose: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.warn and other mocks
  });

  it('should display releasse message with CTA for v3.7.0', async () => {
    showLatestReleaseWebView(mockContext, '3.7.0');

    expect(mockShowInformationMessage).toHaveBeenCalledWith(
      'Decide what is next for Turbo by taking a one minute survey 🚀',
      'Take Survey',
      'Maybe Later',
    );
  });

  it('should open CTA URL when dynamic CTA button is clicked', async () => {
    mockShowInformationMessage.mockResolvedValue('Take Survey');

    const mockOpenExternal = jest
      .spyOn(vscode.env, 'openExternal')
      .mockResolvedValue(true);

    showLatestReleaseWebView(mockContext, '3.7.0');

    // Wait for the async button handler
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockOpenExternal).toHaveBeenCalledWith(
      vscode.Uri.parse('https://www.turboconsolelog.io/community-survey'),
    );
  });
});
