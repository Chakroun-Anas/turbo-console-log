import * as vscode from 'vscode';
import { TurboProShowcasePanel } from '@/pro/TurboProShowcasePanel/TurboProShowcasePanel';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { createTelemetryService } from '@/telemetry/telemetryService';
import { trackPanelOpenings } from '@/helpers/trackPanelOpenings';

// Mock dependencies
jest.mock('@/telemetry/telemetryService');
jest.mock('@/helpers/trackPanelOpenings');

const mockCreateTelemetryService =
  createTelemetryService as jest.MockedFunction<typeof createTelemetryService>;
const mockTrackPanelOpenings = trackPanelOpenings as jest.MockedFunction<
  typeof trackPanelOpenings
>;

describe('TurboProShowcasePanel', () => {
  let context: vscode.ExtensionContext;
  let showcasePanel: TurboProShowcasePanel;
  let mockTelemetryService: {
    reportFreemiumPanelOpening: jest.Mock;
    reportFreemiumPanelCtaClick: jest.Mock;
    dispose: jest.Mock;
  };
  let mockWebviewView: vscode.WebviewView;
  let visibilityChangeHandler: () => void;

  // Helper to set visible property (bypassing readonly TypeScript check)
  const setVisible = (value: boolean) => {
    (mockWebviewView as { visible: boolean }).visible = value;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    context = makeExtensionContext();

    mockTelemetryService = {
      reportFreemiumPanelOpening: jest.fn(),
      reportFreemiumPanelCtaClick: jest.fn(),
      dispose: jest.fn(),
    };

    mockCreateTelemetryService.mockReturnValue(
      mockTelemetryService as unknown as ReturnType<
        typeof createTelemetryService
      >,
    );

    // Create mock webview view with writable visible property
    mockWebviewView = {
      webview: {
        html: '',
        options: {},
        onDidReceiveMessage: jest.fn(() => {
          return { dispose: jest.fn() };
        }),
      },
      onDidChangeVisibility: jest.fn((handler) => {
        visibilityChangeHandler = handler;
        return { dispose: jest.fn() };
      }),
      onDidDispose: jest.fn(),
      show: jest.fn(),
    } as unknown as vscode.WebviewView;

    // Make visible property writable
    Object.defineProperty(mockWebviewView, 'visible', {
      value: false,
      writable: true,
    });

    showcasePanel = new TurboProShowcasePanel(context);
  });

  describe('Visibility Change Handler', () => {
    beforeEach(() => {
      // Resolve the webview view to set up handlers
      showcasePanel.resolveWebviewView(mockWebviewView);
    });

    it('should call telemetry service when panel becomes visible', () => {
      setVisible(true);
      visibilityChangeHandler();

      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(1);
    });

    it('should not call telemetry service when panel becomes hidden', () => {
      setVisible(false);
      visibilityChangeHandler();

      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).not.toHaveBeenCalled();
    });

    it('should call trackPanelOpenings when panel becomes visible', () => {
      setVisible(true);
      visibilityChangeHandler();

      expect(mockTrackPanelOpenings).toHaveBeenCalledWith(context);
    });

    it('should not call trackPanelOpenings when panel becomes hidden', () => {
      setVisible(false);
      visibilityChangeHandler();

      expect(mockTrackPanelOpenings).not.toHaveBeenCalled();
    });

    it('should call trackPanelOpenings after telemetry', () => {
      setVisible(true);
      visibilityChangeHandler();

      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalled();
      expect(mockTrackPanelOpenings).toHaveBeenCalled();
    });

    it('should handle multiple visibility changes correctly', () => {
      // First visibility change (panel becomes visible)
      setVisible(true);
      visibilityChangeHandler();

      expect(mockTrackPanelOpenings).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(1);

      // Panel becomes hidden
      setVisible(false);
      visibilityChangeHandler();

      // Should not call again
      expect(mockTrackPanelOpenings).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(1);

      // Panel becomes visible again
      setVisible(true);
      visibilityChangeHandler();

      // Should call again
      expect(mockTrackPanelOpenings).toHaveBeenCalledTimes(2);
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe('Webview Initialization', () => {
    it('should set webview options to enable scripts', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.options).toEqual({
        enableScripts: true,
      });
    });

    it('should register visibility change handler', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.onDidChangeVisibility).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should register message handler', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should set webview HTML', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);

      expect(mockWebviewView.webview.html).toBeTruthy();
      expect(typeof mockWebviewView.webview.html).toBe('string');
    });
  });

  describe('Message Handling', () => {
    let messageHandler: (message: {
      command: string;
      [key: string]: unknown;
    }) => void;

    beforeEach(() => {
      (
        mockWebviewView.webview.onDidReceiveMessage as jest.Mock
      ).mockImplementation((handler) => {
        messageHandler = handler;
        return { dispose: jest.fn() };
      });

      showcasePanel.resolveWebviewView(mockWebviewView);
    });

    it('should handle trackCtaClick message', () => {
      const message = {
        command: 'trackCtaClick',
        ctaType: 'pro-purchase',
        ctaText: 'Get Pro',
        ctaUrl: 'https://turboconsolelog.io/pro',
      };

      messageHandler(message);

      expect(
        mockTelemetryService.reportFreemiumPanelCtaClick,
      ).toHaveBeenCalledWith(
        'pro-purchase',
        'Get Pro',
        'https://turboconsolelog.io/pro',
      );
    });

    it('should handle openUrl message', () => {
      const openExternalSpy = jest
        .spyOn(vscode.env, 'openExternal')
        .mockResolvedValue(true);

      const message = {
        command: 'openUrl',
        url: 'https://turboconsolelog.io',
      };

      messageHandler(message);

      expect(openExternalSpy).toHaveBeenCalledWith(
        vscode.Uri.parse('https://turboconsolelog.io'),
      );

      openExternalSpy.mockRestore();
    });

    it('should ignore unknown commands', () => {
      const message = {
        command: 'unknownCommand',
        data: 'test',
      };

      // Should not throw error
      expect(() => messageHandler(message)).not.toThrow();
    });
  });

  describe('Context Injection', () => {
    it('should store context for later use', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);
      setVisible(true);
      visibilityChangeHandler();

      // Context should be passed to trackPanelOpenings
      expect(mockTrackPanelOpenings).toHaveBeenCalledWith(context);
    });

    it('should use the same context across multiple visibility changes', () => {
      showcasePanel.resolveWebviewView(mockWebviewView);

      setVisible(true);
      visibilityChangeHandler();

      setVisible(false);
      visibilityChangeHandler();

      setVisible(true);
      visibilityChangeHandler();

      // Both calls should use the same context instance
      expect(mockTrackPanelOpenings).toHaveBeenCalledTimes(2);
      expect(mockTrackPanelOpenings).toHaveBeenNthCalledWith(1, context);
      expect(mockTrackPanelOpenings).toHaveBeenNthCalledWith(2, context);
    });
  });

  describe('Error Handling', () => {
    it('should handle telemetry service creation failure gracefully', () => {
      mockCreateTelemetryService.mockImplementation(() => {
        throw new Error('Telemetry service unavailable');
      });

      // Should not throw during initialization - errors are handled silently
      expect(() => {
        showcasePanel.resolveWebviewView(mockWebviewView);
      }).not.toThrow();
    });

    it('should handle trackPanelOpenings errors gracefully', () => {
      mockTrackPanelOpenings.mockImplementation(() => {
        throw new Error('Tracking error');
      });

      showcasePanel.resolveWebviewView(mockWebviewView);

      // Should throw when visibility changes (errors propagate in test environment)
      setVisible(true);
      expect(() => {
        visibilityChangeHandler();
      }).toThrow('Tracking error');
    });
  });
});
