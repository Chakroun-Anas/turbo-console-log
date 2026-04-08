import { TurboProTrialGuidePanel } from '@/pro/TurboProTrialGuidePanel/TurboProTrialGuidePanel';
import * as vscode from 'vscode';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the HTML generator to focus on panel logic
jest.mock('@/pro/TurboProTrialGuidePanel/html/getStaticHtml', () => ({
  getStaticHtml: jest.fn(),
}));

import { getStaticHtml } from '@/pro/TurboProTrialGuidePanel/html/getStaticHtml';

const mockGetStaticHtml = getStaticHtml as jest.MockedFunction<
  typeof getStaticHtml
>;

describe('TurboProTrialGuidePanel', () => {
  let panel: TurboProTrialGuidePanel;
  let context: vscode.ExtensionContext;
  let mockWebviewView: vscode.WebviewView;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Suppress console logs during tests
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    context = makeExtensionContext();
    panel = new TurboProTrialGuidePanel(context);

    // Mock webview view
    mockWebviewView = {
      webview: {
        options: {},
        html: '',
      },
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
    expect(TurboProTrialGuidePanel.viewType).toBe(
      'turboConsoleLogProTrialGuide',
    );
  });

  it('should set webview options with scripts enabled', () => {
    panel.resolveWebviewView(mockWebviewView);

    expect(mockWebviewView.webview.options).toEqual({
      enableScripts: true,
    });
  });

  it('should set webview HTML content', () => {
    mockGetStaticHtml.mockReturnValue('<div>Guide HTML</div>');

    panel.resolveWebviewView(mockWebviewView);

    expect(mockWebviewView.webview.html).toBe('<div>Guide HTML</div>');
  });

  describe('trial status detection', () => {
    it('should pass shouldHideCta as false when trial status is undefined and no Pro license', () => {
      mockGetStaticHtml.mockReturnValue('<div>No trial, no Pro</div>');
      jest.spyOn(context.globalState, 'get').mockReturnValue(undefined);

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith('trial-status');
      expect(mockGetStaticHtml).toHaveBeenCalledWith(false);
    });

    it('should pass shouldHideCta as true when trial status is active', () => {
      mockGetStaticHtml.mockReturnValue('<div>Active trial</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'trial-status') return 'active';
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith('trial-status');
      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);
    });

    it('should pass shouldHideCta as false when trial status is expired and no Pro license', () => {
      mockGetStaticHtml.mockReturnValue('<div>Expired trial</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'trial-status') return 'expired';
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith('trial-status');
      expect(mockGetStaticHtml).toHaveBeenCalledWith(false);
    });

    it('should pass shouldHideCta as true when user is a Pro user', () => {
      mockGetStaticHtml.mockReturnValue('<div>Pro user</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'trial-status') return undefined;
          if (key === 'license-key') return 'test-license-key';
          if (key === 'pro-bundle') return 'test-pro-bundle';
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(context.globalState.get).toHaveBeenCalledWith('license-key');
      expect(context.globalState.get).toHaveBeenCalledWith('pro-bundle');
      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);
    });

    it('should pass shouldHideCta as false when only license-key exists (incomplete Pro)', () => {
      mockGetStaticHtml.mockReturnValue('<div>Incomplete Pro</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'trial-status') return undefined;
          if (key === 'license-key') return 'test-license-key';
          if (key === 'pro-bundle') return undefined;
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalledWith(false);
    });

    it('should read trial and Pro status from global state on each resolveWebviewView call', () => {
      const getSpy = jest
        .spyOn(context.globalState, 'get')
        .mockReturnValue(undefined);
      mockGetStaticHtml.mockReturnValue('<div>HTML</div>');

      // First call
      panel.resolveWebviewView(mockWebviewView);
      expect(getSpy).toHaveBeenCalledWith('trial-status');
      expect(getSpy).toHaveBeenCalledWith('license-key');
      expect(getSpy).toHaveBeenCalledWith('pro-bundle');
      const firstCallCount = getSpy.mock.calls.length;

      // Second call (simulating panel refresh)
      const mockWebviewView2 = {
        webview: { options: {}, html: '' },
      } as unknown as vscode.WebviewView;
      panel.resolveWebviewView(mockWebviewView2);

      // Should read again (not cached)
      expect(getSpy.mock.calls.length).toBe(firstCallCount * 2);
    });
  });

  describe('HTML generation', () => {
    it('should generate HTML for trial users (no CTA)', () => {
      mockGetStaticHtml.mockReturnValue('<div>Videos without CTA</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'trial-status') return 'active';
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);
      expect(mockWebviewView.webview.html).toBe(
        '<div>Videos without CTA</div>',
      );
    });

    it('should generate HTML for Pro users (no CTA)', () => {
      mockGetStaticHtml.mockReturnValue('<div>Pro user videos</div>');
      jest
        .spyOn(context.globalState, 'get')
        .mockImplementation((key: string) => {
          if (key === 'license-key') return 'test-key';
          if (key === 'pro-bundle') return 'test-bundle';
          return undefined;
        });

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);
      expect(mockWebviewView.webview.html).toBe('<div>Pro user videos</div>');
    });

    it('should generate HTML for non-trial/non-Pro users (with CTA)', () => {
      mockGetStaticHtml.mockReturnValue('<div>Videos with CTA</div>');
      jest.spyOn(context.globalState, 'get').mockReturnValue(undefined);

      panel.resolveWebviewView(mockWebviewView);

      expect(mockGetStaticHtml).toHaveBeenCalledWith(false);
      expect(mockWebviewView.webview.html).toBe('<div>Videos with CTA</div>');
    });
  });

  describe('integration', () => {
    it('should handle multiple panel resolutions with different states', () => {
      const getSpy = jest.spyOn(context.globalState, 'get');

      // First resolution - no trial, no Pro
      getSpy.mockReturnValue(undefined);
      mockGetStaticHtml.mockReturnValue('<div>HTML v1</div>');
      panel.resolveWebviewView(mockWebviewView);
      expect(mockGetStaticHtml).toHaveBeenCalledWith(false);

      // Second resolution - active trial
      const mockWebviewView2 = {
        webview: { options: {}, html: '' },
      } as unknown as vscode.WebviewView;
      getSpy.mockImplementation((key: string) => {
        if (key === 'trial-status') return 'active';
        return undefined;
      });
      mockGetStaticHtml.mockReturnValue('<div>HTML v2</div>');
      panel.resolveWebviewView(mockWebviewView2);
      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);

      // Third resolution - Pro user
      const mockWebviewView3 = {
        webview: { options: {}, html: '' },
      } as unknown as vscode.WebviewView;
      getSpy.mockImplementation((key: string) => {
        if (key === 'license-key') return 'key';
        if (key === 'pro-bundle') return 'bundle';
        return undefined;
      });
      mockGetStaticHtml.mockReturnValue('<div>HTML v3</div>');
      panel.resolveWebviewView(mockWebviewView3);
      expect(mockGetStaticHtml).toHaveBeenCalledWith(true);
    });
  });
});
