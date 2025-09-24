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
      id: 'test-status-bar',
      name: 'Test Status Bar',
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
      backgroundColor: undefined,
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
    showReleaseStatusBar(context, '3.5.0');

    expect(mockCreateStatusBarItem).toHaveBeenCalledWith(
      vscode.StatusBarAlignment.Left,
      100,
    );
    expect(mockStatusBarItem.text).toBe(
      '🚀 v3.5.0 → Decide what is next for Turbo!',
    );
    expect(mockStatusBarItem.tooltip).toBe(
      'Take a one minute survey shaping the future of Turbo',
    );
    expect(mockStatusBarItem.show).toHaveBeenCalled();
  });

  it('should register command with unique ID and set it on status bar', () => {
    showReleaseStatusBar(context, '3.5.0');

    expect(mockRegisterCommand).toHaveBeenCalled();
    const commandId = (mockRegisterCommand as jest.Mock).mock.calls[0][0];
    expect(commandId).toMatch(/^turbo\.releaseCta\.\d+$/);
    expect(mockStatusBarItem.command).toBe(commandId);
  });

  it('should add disposables to context subscriptions', () => {
    showReleaseStatusBar(context, '3.5.0');

    expect(context.subscriptions).toContain(mockStatusBarItem);
    expect(context.subscriptions).toContain(mockDisposable);
  });

  describe('status bar click handler', () => {
    let commandHandler: () => Promise<void>;

    beforeEach(() => {
      showReleaseStatusBar(context, '3.5.0');
      commandHandler = (mockRegisterCommand as jest.Mock).mock.calls[0][1];
    });

    it('should show information message when status bar is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await commandHandler();

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        `Decide what is next for Turbo by taking a one minute survey 🚀`,
        'Take Survey',
        'Maybe Later',
        'Dismiss',
      );
    });
  });
});
