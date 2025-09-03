import * as vscode from 'vscode';
import { showReleaseStatusBar } from '@/helpers/showReleaseStatusBar';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock dependencies
jest.mock('vscode', () => ({
  window: {
    createStatusBarItem: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
  },
  StatusBarAlignment: {
    Left: 1,
  },
  commands: {
    registerCommand: jest.fn(),
  },
  env: {
    openExternal: jest.fn(),
  },
  Uri: {
    parse: jest.fn(),
  },
}));

jest.mock('@/releases/releaseNotes', () => ({
  releaseNotes: {
    '3.5.0': {
      releaseArticleUrl: 'https://example.com/release',
      webViewHtml: '<html>Release notes</html>',
    },
    '3.4.0': {
      webViewHtml: '<html>Old release notes</html>',
    },
  },
}));

// Mock UI module with proper structure
jest.mock('@/ui', () => ({
  openWebView: jest.fn(),
}));

describe('showReleaseStatusBar', () => {
  let mockStatusBarItem: jest.Mocked<vscode.StatusBarItem>;
  let mockDisposable: jest.Mocked<vscode.Disposable>;
  let context: ReturnType<typeof makeExtensionContext>;

  const mockCreateStatusBarItem = vscode.window
    .createStatusBarItem as jest.MockedFunction<
    typeof vscode.window.createStatusBarItem
  >;
  const mockRegisterCommand = vscode.commands
    .registerCommand as jest.MockedFunction<
    typeof vscode.commands.registerCommand
  >;
  const mockShowInformationMessage = vscode.window
    .showInformationMessage as jest.MockedFunction<
    typeof vscode.window.showInformationMessage
  >;
  const mockUriParse = vscode.Uri.parse as jest.MockedFunction<
    typeof vscode.Uri.parse
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    context = makeExtensionContext();

    // Create mock status bar item
    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: undefined,
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn(),
      alignment: vscode.StatusBarAlignment.Left,
      priority: 100,
      accessibilityInformation: undefined,
      color: undefined,
    };

    // Create mock disposable
    mockDisposable = {
      dispose: jest.fn(),
    };

    mockCreateStatusBarItem.mockReturnValue(mockStatusBarItem);
    mockRegisterCommand.mockReturnValue(mockDisposable);
    mockUriParse.mockReturnValue({} as vscode.Uri);
  });

  it('should create and show status bar item with correct properties', () => {
    showReleaseStatusBar(context, '3.5.0', '🚀');

    expect(mockCreateStatusBarItem).toHaveBeenCalledWith(
      vscode.StatusBarAlignment.Left,
      100,
    );
    expect(mockStatusBarItem.text).toBe('🚀 v3.5.0 → Regional pricing! 🚀 ');
    expect(mockStatusBarItem.tooltip).toBe(
      'Turbo Console Log introduces regional pricing!',
    );
    expect(mockStatusBarItem.show).toHaveBeenCalled();
  });

  it('should register command with unique ID and set it on status bar', () => {
    showReleaseStatusBar(context, '3.5.0', '🚀');

    expect(mockRegisterCommand).toHaveBeenCalled();
    const commandId = (mockRegisterCommand as jest.Mock).mock.calls[0][0];
    expect(commandId).toMatch(/^turbo\.releaseCta\.\d+$/);
    expect(mockStatusBarItem.command).toBe(commandId);
  });

  it('should add disposables to context subscriptions', () => {
    showReleaseStatusBar(context, '3.5.0', '🚀');

    expect(context.subscriptions).toContain(mockStatusBarItem);
    expect(context.subscriptions).toContain(mockDisposable);
  });

  describe('status bar click handler', () => {
    let commandHandler: () => Promise<void>;

    beforeEach(() => {
      showReleaseStatusBar(context, '3.5.0', '🚀');
      commandHandler = (mockRegisterCommand as jest.Mock).mock.calls[0][1];
    });

    it('should show information message when status bar is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await commandHandler();

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        `🚀 Turbo Console Log v3.5.0 introduces regional pricing!`,
        'Maybe Later',
        'Dismiss',
      );
    });
  });
});
