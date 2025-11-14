import * as vscode from 'vscode';
import axios from 'axios';
import { showReleaseWebView } from '@/helpers/showReleaseWebView';
import * as helpers from '@/helpers';
import { createTelemetryService } from '@/telemetry/telemetryService';
import { GlobalStateKey } from '@/entities';
import { WEBVIEW_FALLBACK_VARIANTS } from '@/releases/3100';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
}));

jest.mock('@/telemetry/telemetryService', () => ({
  createTelemetryService: jest.fn(),
}));

jest.mock('@/releases/3100', () => ({
  WEBVIEW_FALLBACK_VARIANTS: {
    A: {
      title: 'Test Variant A',
      htmlContent: '<html><body>Variant A Content</body></html>',
    },
    B: {
      title: 'Test Variant B',
      htmlContent: '<html><body>Variant B Content</body></html>',
    },
    C: {
      title: 'Test Variant C',
      htmlContent: '<html><body>Variant C Content</body></html>',
    },
  },
}));

describe('showReleaseWebView', () => {
  let mockContext: vscode.ExtensionContext;
  let mockPanel: vscode.WebviewPanel;
  let mockTelemetryService: {
    reportWebviewInteraction: jest.Mock;
  };
  let mockCreateWebviewPanel: jest.Mock;
  let mockOpenExternal: jest.Mock;
  let onDidReceiveMessageHandler:
    | ((message: { command: string; url?: string }) => void)
    | undefined;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.error to suppress expected error logs in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Reset onDidReceiveMessage handler
    onDidReceiveMessageHandler = undefined;

    // Mock extension context
    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as vscode.ExtensionContext;

    // Mock webview panel
    mockPanel = {
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn((handler) => {
          onDidReceiveMessageHandler = handler;
          return { dispose: jest.fn() };
        }),
      },
    } as unknown as vscode.WebviewPanel;

    // Mock vscode.window.createWebviewPanel
    mockCreateWebviewPanel = jest.fn().mockReturnValue(mockPanel);
    (
      vscode.window as unknown as { createWebviewPanel: jest.Mock }
    ).createWebviewPanel = mockCreateWebviewPanel;

    // Mock vscode.env.openExternal
    mockOpenExternal = jest.fn().mockResolvedValue(true);
    (vscode.env as unknown as { openExternal: jest.Mock }).openExternal =
      mockOpenExternal;

    // Mock telemetry service
    mockTelemetryService = {
      reportWebviewInteraction: jest.fn().mockResolvedValue(undefined),
    };
    (createTelemetryService as jest.Mock).mockReturnValue(mockTelemetryService);

    // Mock helpers
    (helpers.readFromGlobalState as jest.Mock).mockReturnValue(undefined);
    (helpers.writeToGlobalState as jest.Mock).mockReturnValue(undefined);

    // Mock successful axios response
    mockedAxios.get.mockResolvedValue({
      data: {
        variant: 'A',
        version: '3.10.0',
        title: 'PHP Support Released!',
        htmlContent: '<html><body>Test Content</body></html>',
      },
    });
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('show once logic', () => {
    it('should not show webview if already shown', async () => {
      (helpers.readFromGlobalState as jest.Mock).mockReturnValue(true);

      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).not.toHaveBeenCalled();
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(
        mockTelemetryService.reportWebviewInteraction,
      ).not.toHaveBeenCalled();
    });

    it('should show webview if not previously shown', async () => {
      (helpers.readFromGlobalState as jest.Mock).mockReturnValue(false);

      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should check correct global state key', async () => {
      await showReleaseWebView(mockContext);

      expect(helpers.readFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        `${GlobalStateKey.HAS_SHOWN_RELEASE_WEBVIEW}3.10.0`,
      );
    });

    it('should mark webview as shown even on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      await showReleaseWebView(mockContext);

      expect(helpers.writeToGlobalState).toHaveBeenCalledWith(
        mockContext,
        `${GlobalStateKey.HAS_SHOWN_RELEASE_WEBVIEW}3.10.0`,
        true,
      );
    });
  });

  describe('Thompson Sampling API integration', () => {
    it('should fetch variant from Thompson Sampling API', async () => {
      await showReleaseWebView(mockContext);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/webviewVariant?version=3.10.0',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should create webview with API-provided content', async () => {
      const apiResponse = {
        variant: 'B',
        version: '3.10.0',
        title: 'API Title',
        htmlContent: '<html><body>API Content</body></html>',
      };
      mockedAxios.get.mockResolvedValue({
        data: apiResponse,
      });

      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        'turboReleaseWebview',
        'API Title',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
        },
      );
      expect(mockPanel.webview.html).toBe(
        '<html><body>API Content</body></html>',
      );
    });

    it('should track shown event with correct variant from API', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          variant: 'C',
          version: '3.10.0',
          title: 'Test',
          htmlContent: '<html></html>',
        },
      });

      await showReleaseWebView(mockContext);

      // Wait for async telemetry call
      await new Promise(process.nextTick);

      expect(
        mockTelemetryService.reportWebviewInteraction,
      ).toHaveBeenCalledWith('3.10.0', 'C', 'shown');
    });

    it('should handle API error with 404 status', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 404,
          statusText: 'Not Found',
        },
      });

      await showReleaseWebView(mockContext);

      // Should fallback to variant A
      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        'turboReleaseWebview',
        'Test Variant A',
        expect.any(Number),
        expect.any(Object),
      );
      expect(mockPanel.webview.html).toBe(
        '<html><body>Variant A Content</body></html>',
      );
    });

    it('should handle API error with 500 status', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

      await showReleaseWebView(mockContext);

      // Should fallback to variant A
      expect(mockCreateWebviewPanel).toHaveBeenCalled();
      expect(mockPanel.webview.html).toContain('Variant A Content');
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await showReleaseWebView(mockContext);

      // Should fallback to variant A
      expect(mockCreateWebviewPanel).toHaveBeenCalled();
      expect(mockPanel.webview.html).toBe(
        '<html><body>Variant A Content</body></html>',
      );
    });
  });

  describe('fallback behavior', () => {
    it('should use fallback variant A when API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Fetch failed'));

      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        'turboReleaseWebview',
        'Test Variant A',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
        },
      );
    });

    it('should still create webview even when API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API down'));

      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalled();
      expect(mockPanel.webview.html).toBeTruthy();
    });

    it('should use WEBVIEW_FALLBACK_VARIANTS for fallback content', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Error'));

      await showReleaseWebView(mockContext);

      expect(mockPanel.webview.html).toBe(
        WEBVIEW_FALLBACK_VARIANTS['A'].htmlContent,
      );
    });
  });

  describe('telemetry tracking', () => {
    it('should track shown event after webview is displayed', async () => {
      await showReleaseWebView(mockContext);

      // Wait for async call
      await new Promise(process.nextTick);

      expect(
        mockTelemetryService.reportWebviewInteraction,
      ).toHaveBeenCalledWith('3.10.0', 'A', 'shown');
    });

    it('should handle telemetry errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockTelemetryService.reportWebviewInteraction.mockRejectedValue(
        new Error('Telemetry failed'),
      );

      await showReleaseWebView(mockContext);

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Webview should still be created even if telemetry fails
      expect(mockCreateWebviewPanel).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should track clicked event when user clicks CTA', async () => {
      await showReleaseWebView(mockContext);

      // Simulate CTA click
      if (onDidReceiveMessageHandler) {
        await onDidReceiveMessageHandler({
          command: 'openExternal',
          url: 'https://www.turboconsolelog.io/pro',
        });
      }

      // Wait for async call
      await new Promise(process.nextTick);

      expect(
        mockTelemetryService.reportWebviewInteraction,
      ).toHaveBeenCalledWith('3.10.0', 'A', 'clicked');
    });

    it('should not crash if telemetry service fails on click', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockTelemetryService.reportWebviewInteraction.mockRejectedValue(
        new Error('Telemetry error'),
      );

      await showReleaseWebView(mockContext);

      // Simulate CTA click
      if (onDidReceiveMessageHandler) {
        await expect(
          onDidReceiveMessageHandler({
            command: 'openExternal',
            url: 'https://www.turboconsolelog.io/pro',
          }),
        ).resolves.not.toThrow();
      }

      consoleWarnSpy.mockRestore();
    });
  });

  describe('webview panel configuration', () => {
    it('should create webview with correct view type', async () => {
      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        'turboReleaseWebview',
        expect.any(String),
        expect.any(Number),
        expect.any(Object),
      );
    });

    it('should create webview in ViewColumn.One', async () => {
      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        vscode.ViewColumn.One,
        expect.any(Object),
      );
    });

    it('should enable scripts in webview', async () => {
      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          enableScripts: true,
        }),
      );
    });

    it('should not retain context when hidden', async () => {
      await showReleaseWebView(mockContext);

      expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({
          retainContextWhenHidden: false,
        }),
      );
    });

    it('should set HTML content on webview', async () => {
      await showReleaseWebView(mockContext);

      expect(mockPanel.webview.html).toBeTruthy();
      expect(typeof mockPanel.webview.html).toBe('string');
    });
  });

  describe('message handling', () => {
    it('should register onDidReceiveMessage handler', async () => {
      await showReleaseWebView(mockContext);

      expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
    });

    it('should open external URL when openExternal command is received', async () => {
      await showReleaseWebView(mockContext);

      const testUrl = 'https://www.turboconsolelog.io/pro?utm_source=extension';

      if (onDidReceiveMessageHandler) {
        await onDidReceiveMessageHandler({
          command: 'openExternal',
          url: testUrl,
        });
      }

      expect(mockOpenExternal).toHaveBeenCalledWith(testUrl);
    });

    it('should add message handler to subscriptions', async () => {
      await showReleaseWebView(mockContext);

      expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        mockContext.subscriptions,
      );
    });

    it('should ignore unknown commands', async () => {
      await showReleaseWebView(mockContext);

      if (onDidReceiveMessageHandler) {
        await onDidReceiveMessageHandler({
          command: 'unknownCommand',
        });
      }

      // Should not throw or call openExternal
      expect(mockOpenExternal).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle malformed API response', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          // Missing required fields
          variant: 'A',
        },
      });

      await expect(showReleaseWebView(mockContext)).resolves.not.toThrow();
      // Should fallback
      expect(mockCreateWebviewPanel).toHaveBeenCalled();
    });

    it('should handle API returning non-JSON', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Invalid JSON'));

      await showReleaseWebView(mockContext);

      // Should fallback to variant A
      expect(mockPanel.webview.html).toContain('Variant A Content');
    });

    it('should handle missing context subscriptions', async () => {
      const contextWithoutSubs = {
        ...mockContext,
        subscriptions: undefined,
      } as unknown as vscode.ExtensionContext;

      await expect(
        showReleaseWebView(contextWithoutSubs),
      ).resolves.not.toThrow();
    });
  });

  describe('version-specific behavior', () => {
    it('should use version 3.10.0 for API request', async () => {
      await showReleaseWebView(mockContext);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('version=3.10.0'),
        expect.any(Object),
      );
    });

    it('should use version 3.10.0 for state key', async () => {
      await showReleaseWebView(mockContext);

      expect(helpers.readFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        expect.stringContaining('3.10.0'),
      );
    });

    it('should pass version 3.10.0 to telemetry', async () => {
      await showReleaseWebView(mockContext);

      await new Promise(process.nextTick);

      expect(
        mockTelemetryService.reportWebviewInteraction,
      ).toHaveBeenCalledWith('3.10.0', expect.any(String), expect.any(String));
    });
  });
});
