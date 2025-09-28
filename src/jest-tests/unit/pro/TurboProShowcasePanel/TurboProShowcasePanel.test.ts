import { TurboProShowcasePanel } from '@/pro/TurboProShowcasePanel/TurboProShowcasePanel';
import * as vscode from 'vscode';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { GlobalStateKeys } from '@/helpers/GlobalStateKeys';
import { DynamicFreemiumPanel } from '@/pro/TurboProShowcasePanel/types';

// Mock the HTML generators to focus on panel logic
jest.mock('@/pro/TurboProShowcasePanel/html/getDynamicHtml', () => ({
  getDynamicHtml: jest.fn(),
}));
jest.mock('@/pro/TurboProShowcasePanel/html/getStaticHtml', () => ({
  getStaticHtml: jest.fn(),
}));
jest.mock('@/telemetry/telemetryService');

import { getDynamicHtml } from '@/pro/TurboProShowcasePanel/html/getDynamicHtml';
import { getStaticHtml } from '@/pro/TurboProShowcasePanel/html/getStaticHtml';
import { createTelemetryService } from '@/telemetry/telemetryService';

// Mock telemetry service
const mockTelemetryService = {
  reportFreemiumPanelOpening: jest.fn(),
  reportFreemiumPanelCtaClick: jest.fn(),
  reportFreshInstall: jest.fn(),
  reportUpdate: jest.fn(),
  reportCommandsInserted: jest.fn(),
  dispose: jest.fn(),
} as unknown as ReturnType<typeof createTelemetryService>;
const mockCreateTelemetryService =
  createTelemetryService as jest.MockedFunction<typeof createTelemetryService>;
mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

const mockGetDynamicHtml = getDynamicHtml as jest.MockedFunction<
  typeof getDynamicHtml
>;
const mockGetStaticHtml = getStaticHtml as jest.MockedFunction<
  typeof getStaticHtml
>;

describe('TurboProShowcasePanel', () => {
  let panel: TurboProShowcasePanel;
  let context: vscode.ExtensionContext;
  let mockWebviewView: vscode.WebviewView;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Suppress console logs during tests
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Reset telemetry service mock
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

    context = makeExtensionContext();
    panel = new TurboProShowcasePanel(context);

    // Mock webview view
    mockWebviewView = {
      webview: {
        options: {},
        html: '',
        onDidReceiveMessage: jest.fn(),
      },
      visible: false,
      onDidChangeVisibility: jest.fn(),
    } as unknown as vscode.WebviewView;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should implement WebviewViewProvider interface', () => {
    expect(panel).toHaveProperty('resolveWebviewView');
    expect(typeof panel.resolveWebviewView).toBe('function');
  });

  it('should have correct viewType', () => {
    expect(TurboProShowcasePanel.viewType).toBe('turboConsoleLogFreemiumPanel');
  });

  it('should set webview options with scripts enabled', () => {
    panel.resolveWebviewView(mockWebviewView);

    expect(mockWebviewView.webview.options).toEqual({
      enableScripts: true,
    });
  });

  it('should set webview HTML content', () => {
    mockGetStaticHtml.mockReturnValue('<div>Static HTML</div>');

    panel.resolveWebviewView(mockWebviewView);

    expect(mockWebviewView.webview.html).toBe('<div>Static HTML</div>');
  });

  it('should register message handler', () => {
    panel.resolveWebviewView(mockWebviewView);

    expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  describe('getHtml method', () => {
    it('should return static HTML when no dynamic content exists', () => {
      mockGetStaticHtml.mockReturnValue('<div>Static content</div>');
      jest.spyOn(context.globalState, 'get').mockReturnValue(undefined);

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith(
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
      );
      expect(mockGetStaticHtml).toHaveBeenCalled();
      expect(mockGetDynamicHtml).not.toHaveBeenCalled();
    });

    it('should return static HTML when dynamic content has empty content array', () => {
      const emptyDynamicContent: DynamicFreemiumPanel = {
        tooltip: 'Test tooltip',
        date: '2025-09-27',
        content: [],
      };

      mockGetStaticHtml.mockReturnValue('<div>Static content</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockReturnValue(emptyDynamicContent);

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalled();
      expect(mockGetDynamicHtml).not.toHaveBeenCalled();
    });

    it('should return static HTML when dynamic content has no content property', () => {
      const incompleteContent = {
        tooltip: 'Test tooltip',
        date: '2025-09-27',
        // Missing content property
      } as DynamicFreemiumPanel;

      mockGetStaticHtml.mockReturnValue('<div>Static content</div>');
      jest.spyOn(context.globalState, 'get').mockReturnValue(incompleteContent);

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalled();
      expect(mockGetDynamicHtml).not.toHaveBeenCalled();
    });

    it('should return dynamic HTML when valid dynamic content exists', () => {
      const validDynamicContent: DynamicFreemiumPanel = {
        tooltip: 'Test tooltip',
        date: '2025-09-27',
        content: [
          {
            type: 'paragraph',
            component: { title: 'Test Title', content: 'Test content' },
          },
        ],
      };

      mockGetDynamicHtml.mockReturnValue('<div>Dynamic content</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockReturnValue(validDynamicContent);

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith(
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
      );
      expect(mockGetDynamicHtml).toHaveBeenCalledWith(validDynamicContent);
      expect(mockGetStaticHtml).not.toHaveBeenCalled();
    });
  });

  describe('telemetry integration', () => {
    beforeEach(() => {
      // Enhanced webview mock with visibility change functionality
      mockWebviewView = {
        webview: {
          options: {},
          html: '',
          onDidReceiveMessage: jest.fn(),
        },
        visible: true, // Set to true to simulate panel becoming visible
        onDidChangeVisibility: jest
          .fn()
          .mockReturnValue({ dispose: jest.fn() }),
      } as unknown as vscode.WebviewView;
    });

    it('should register visibility change handler during panel initialization', () => {
      panel.resolveWebviewView(mockWebviewView);

      // Verify visibility handler was registered
      expect(mockWebviewView.onDidChangeVisibility).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should create telemetry service and report panel opening when webview becomes visible', () => {
      panel.resolveWebviewView(mockWebviewView);

      // Get the registered visibility handler
      const visibilityHandler = (
        mockWebviewView.onDidChangeVisibility as jest.Mock
      ).mock.calls[0][0];

      // Simulate visibility change event - panel becomes visible
      visibilityHandler();

      // Should create telemetry service and report panel opening
      expect(mockCreateTelemetryService).toHaveBeenCalled();
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledWith();
    });

    it('should not report panel opening when webview is not visible', () => {
      // Create webview mock that is not visible
      const notVisibleWebview = {
        webview: {
          options: {},
          html: '',
          onDidReceiveMessage: jest.fn(),
        },
        visible: false,
        onDidChangeVisibility: jest
          .fn()
          .mockReturnValue({ dispose: jest.fn() }),
      } as unknown as vscode.WebviewView;

      panel.resolveWebviewView(notVisibleWebview);

      // Get the registered visibility handler
      const visibilityHandler = (
        notVisibleWebview.onDidChangeVisibility as jest.Mock
      ).mock.calls[0][0];

      // Simulate visibility change event - panel is not visible
      visibilityHandler();

      // Should not report panel opening when not visible
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).not.toHaveBeenCalled();
    });

    it('should track multiple visibility changes independently', () => {
      panel.resolveWebviewView(mockWebviewView);

      // Get the registered visibility handler
      const visibilityHandler = (
        mockWebviewView.onDidChangeVisibility as jest.Mock
      ).mock.calls[0][0];

      // Simulate multiple visibility changes when panel is visible
      visibilityHandler();
      visibilityHandler();
      visibilityHandler();

      // Should report each visibility change (this is expected behavior)
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(3);
    });
  });

  describe('message handling', () => {
    it('should handle openUrl messages', () => {
      const openExternalSpy = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);
      const uriParseSpy = jest
        .spyOn(vscode.Uri, 'parse')
        .mockReturnValue({} as vscode.Uri);

      panel.resolveWebviewView(mockWebviewView);

      // Get the message handler that was registered
      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Call the handler with an openUrl message
      messageHandler({
        command: 'openUrl',
        url: 'https://example.com',
      });

      expect(uriParseSpy).toHaveBeenCalledWith('https://example.com');
      expect(openExternalSpy).toHaveBeenCalled();

      openExternalSpy.mockRestore();
      uriParseSpy.mockRestore();
    });

    it('should ignore unknown message commands', () => {
      const openExternalSpy = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);

      panel.resolveWebviewView(mockWebviewView);

      // Get the message handler
      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Call with unknown command
      messageHandler({
        command: 'unknownCommand',
        data: 'test',
      });

      expect(openExternalSpy).not.toHaveBeenCalled();

      openExternalSpy.mockRestore();
    });

    it('should handle malformed openUrl messages gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const openExternalSpy = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);

      panel.resolveWebviewView(mockWebviewView);

      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Call with missing URL
      messageHandler({
        command: 'openUrl',
        // Missing url property
      });

      // VS Code will try to parse undefined URL, so openExternal may still be called
      // The important thing is that it doesn't crash

      openExternalSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle trackCtaClick messages and report analytics', () => {
      panel.resolveWebviewView(mockWebviewView);

      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Call trackCtaClick message
      messageHandler({
        command: 'trackCtaClick',
        ctaType: 'survey',
        ctaText: '📝 Take Survey',
        ctaUrl: 'https://www.turboconsolelog.io/community-survey',
      });

      // Should create telemetry service and report CTA click
      expect(mockCreateTelemetryService).toHaveBeenCalled();
      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).toHaveBeenCalledWith(
        'survey',
        '📝 Take Survey',
        'https://www.turboconsolelog.io/community-survey',
      );
    });

    it('should handle trackCtaClick messages with different CTA types', () => {
      panel.resolveWebviewView(mockWebviewView);

      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Test countdown CTA
      messageHandler({
        command: 'trackCtaClick',
        ctaType: 'countdown',
        ctaText: '🔥 Unlock Turbo PRO Now!',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
      });

      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).toHaveBeenCalledWith(
        'countdown',
        '🔥 Unlock Turbo PRO Now!',
        'https://www.turboconsolelog.io/pro',
      );

      // Reset mock calls
      jest.clearAllMocks();

      // Test article CTA
      messageHandler({
        command: 'trackCtaClick',
        ctaType: 'article',
        ctaText: 'Debugging: Between Science & Art',
        ctaUrl: 'https://www.turboconsolelog.io/articles/debugging-science-art',
      });

      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).toHaveBeenCalledWith(
        'article',
        'Debugging: Between Science & Art',
        'https://www.turboconsolelog.io/articles/debugging-science-art',
      );
    });

    it('should handle trackCtaClick messages with missing properties gracefully', () => {
      panel.resolveWebviewView(mockWebviewView);

      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Call with missing properties - should still work (undefined values)
      messageHandler({
        command: 'trackCtaClick',
        ctaType: 'survey',
        // Missing ctaText and ctaUrl
      });

      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).toHaveBeenCalledWith('survey', undefined, undefined);
    });

    it('should not interfere with existing openUrl message handling', () => {
      const openExternalSpy = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);
      const uriParseSpy = jest.spyOn(vscode.Uri, 'parse');

      panel.resolveWebviewView(mockWebviewView);

      const messageHandler = (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mock.calls[0][0];

      // Test that openUrl still works after adding trackCtaClick
      messageHandler({
        command: 'openUrl',
        url: 'https://www.turboconsolelog.io/pro',
      });

      expect(uriParseSpy).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/pro',
      );
      expect(openExternalSpy).toHaveBeenCalled();

      // CTA click should not have been triggered
      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).not.toHaveBeenCalled();

      openExternalSpy.mockRestore();
      uriParseSpy.mockRestore();
    });
  });
});
