import { showLatestReleaseWebView } from '@/releases/showReleaseHtmlWebView/showLatestReleaseWebView';
import { isProUser } from '@/helpers';
import { fetchCustomReleaseMessage } from '@/utilities/fetchCustomReleaseMessage';
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
jest.mock('@/helpers/isProUser');
jest.mock('@/utilities/fetchCustomReleaseMessage');
jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/helpers/showReleaseStatusBar');
jest.mock('@/ui/helpers/openWebView');
jest.mock('@/telemetry');

const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
const mockFetchCustomReleaseMessage =
  fetchCustomReleaseMessage as jest.MockedFunction<
    typeof fetchCustomReleaseMessage
  >;
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

  describe('for pro users', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(true);
    });

    it('should show pro-specific message without CTA', async () => {
      await showLatestReleaseWebView(mockContext, '3.6.0');

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining("Hope you're enjoying your Turbo Pro bundle"),
      );
      expect(mockFetchCustomReleaseMessage).not.toHaveBeenCalled();
    });
  });

  describe('for non-pro users', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should fetch and display custom message with dynamic CTA for v3.6.0', async () => {
      const mockCustomMessage = {
        message:
          '🚀 Turbo Console Log introduces regional pricing! 🇺🇸 Turbo Pro is now adapted for your region.',
        ctaText: 'Check Pro',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
        countryFlag: '🇺🇸',
        countryCode: 'US',
      };

      mockFetchCustomReleaseMessage.mockResolvedValue(mockCustomMessage);

      await showLatestReleaseWebView(mockContext, '3.6.0');

      expect(mockFetchCustomReleaseMessage).toHaveBeenCalledWith('v3.6.0');
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        mockCustomMessage.message,
        'Check Pro',
        'Maybe Later',
      );
    });

    it('should show fallback message when API call fails', async () => {
      mockFetchCustomReleaseMessage.mockRejectedValue(new Error('API failed'));

      await showLatestReleaseWebView(mockContext, '3.6.0');

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringMatching(/Turbo Console Log.*introduces regional pricing/),
        'Check Pro',
        'Maybe Later',
      );
    });

    it('should show fallback message when API returns null', async () => {
      mockFetchCustomReleaseMessage.mockResolvedValue(null);

      await showLatestReleaseWebView(mockContext, '3.6.0');

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringMatching(/Turbo Console Log.*introduces regional pricing/),
        'Check Pro',
        'Maybe Later',
      );
    });

    it('should not include View Release Notes button for v3.6.0 (no release notes)', async () => {
      const mockCustomMessage = {
        message: '🚀 Turbo Console Log introduces regional pricing!',
        ctaText: 'Check Pro',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
        countryFlag: '🇺🇸',
        countryCode: 'US',
      };

      mockFetchCustomReleaseMessage.mockResolvedValue(mockCustomMessage);

      await showLatestReleaseWebView(mockContext, '3.6.0');

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        mockCustomMessage.message,
        'Check Pro',
        'Maybe Later',
      );
    });
  });

  describe('button handling', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should open CTA URL when dynamic CTA button is clicked', async () => {
      const mockCustomMessage = {
        message: '🚀 Turbo Console Log introduces regional pricing!',
        ctaText: 'Check Pro',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
        countryFlag: '🇺🇸',
        countryCode: 'US',
      };

      mockFetchCustomReleaseMessage.mockResolvedValue(mockCustomMessage);
      mockShowInformationMessage.mockResolvedValue('Check Pro');

      const mockOpenExternal = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);

      await showLatestReleaseWebView(mockContext, '3.6.0');

      // Wait for the async button handler
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOpenExternal).toHaveBeenCalledWith(
        vscode.Uri.parse('https://www.turboconsolelog.io/pro'),
      );
    });

    it('should handle fallback CTA button when API fails', async () => {
      mockFetchCustomReleaseMessage.mockRejectedValue(new Error('API failed'));
      mockShowInformationMessage.mockResolvedValue('Check Pro');

      const mockOpenExternal = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);

      await showLatestReleaseWebView(mockContext, '3.6.0');

      // Wait for the async button handler
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOpenExternal).toHaveBeenCalledWith(
        vscode.Uri.parse('https://www.turboconsolelog.io/pro'),
      );
    });
  });
});
