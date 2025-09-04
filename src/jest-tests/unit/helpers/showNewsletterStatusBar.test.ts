import { showNewsletterStatusBar } from '@/helpers/showNewsletterStatusBar';
import { writeToGlobalState } from '@/helpers';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';

jest.mock('@/helpers');
jest.mock('vscode', () => ({
  window: {
    createStatusBarItem: jest.fn(),
    showInformationMessage: jest.fn(),
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

describe('showNewsletterStatusBar', () => {
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockCreateStatusBarItem = vscode.window
    .createStatusBarItem as jest.MockedFunction<
    typeof vscode.window.createStatusBarItem
  >;
  const mockShowInformationMessage = vscode.window
    .showInformationMessage as jest.MockedFunction<
    typeof vscode.window.showInformationMessage
  >;
  const mockRegisterCommand = vscode.commands
    .registerCommand as jest.MockedFunction<
    typeof vscode.commands.registerCommand
  >;
  const mockOpenExternal = vscode.env.openExternal as jest.MockedFunction<
    typeof vscode.env.openExternal
  >;
  const mockUriParse = vscode.Uri.parse as jest.MockedFunction<
    typeof vscode.Uri.parse
  >;

  let context: ReturnType<typeof makeExtensionContext>;
  let mockStatusBarItem: jest.Mocked<vscode.StatusBarItem>;
  let mockDisposable: jest.Mocked<vscode.Disposable>;

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

  describe('Status bar creation and setup', () => {
    it('should create status bar item with correct properties', () => {
      showNewsletterStatusBar(context);

      expect(mockCreateStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Left,
        100,
      );
      expect(mockStatusBarItem.text).toBe('🎉 10 logs → Join newsletter 🚀');
      expect(mockStatusBarItem.tooltip).toBe(
        'Join our newsletter for exclusive surveys, tips, updates!',
      );
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });

    it('should register a command with unique ID', () => {
      showNewsletterStatusBar(context);

      expect(mockRegisterCommand).toHaveBeenCalledTimes(1);
      const commandId = mockRegisterCommand.mock.calls[0][0];
      expect(commandId).toMatch(/^turbo\.newsletterCta\.\d+$/);
      expect(typeof mockRegisterCommand.mock.calls[0][1]).toBe('function');
    });

    it('should set the command on the status bar item', () => {
      showNewsletterStatusBar(context);

      const commandId = mockRegisterCommand.mock.calls[0][0];
      expect(mockStatusBarItem.command).toBe(commandId);
    });

    it('should add disposables to context subscriptions', () => {
      showNewsletterStatusBar(context);

      expect(context.subscriptions).toHaveLength(2);
      expect(context.subscriptions).toContain(mockStatusBarItem);
      expect(context.subscriptions).toContain(mockDisposable);
    });
  });

  describe('Command handler behavior', () => {
    let commandHandler: () => Promise<void>;

    beforeEach(() => {
      showNewsletterStatusBar(context);
      commandHandler = mockRegisterCommand.mock
        .calls[0][1] as () => Promise<void>;
    });

    it('should show information message when command is executed', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await commandHandler();

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        "🎉 Great job! You've used Turbo 10 times. Join our newsletter for exclusive surveys, tips, updates!",
        'Join Newsletter',
        'Later',
        'Dismiss',
      );
    });

    describe('Join Newsletter action', () => {
      it('should open external URL and dispose resources when Join Newsletter is clicked', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockShowInformationMessage.mockResolvedValue('Join Newsletter' as any);

        await commandHandler();

        expect(mockUriParse).toHaveBeenCalledWith(
          'https://www.turboconsolelog.io/join',
        );
        expect(mockOpenExternal).toHaveBeenCalledWith({});
        expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        expect(mockDisposable.dispose).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          context,
          'SHOULD_SHOW_NEWSLETTER_STATUS_BAR',
          false,
        );
      });
    });

    describe('Dismiss action', () => {
      it('should dispose resources and update global state when Dismiss is clicked', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockShowInformationMessage.mockResolvedValue('Dismiss' as any);

        await commandHandler();

        expect(mockOpenExternal).not.toHaveBeenCalled();
        expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        expect(mockDisposable.dispose).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          context,
          'SHOULD_SHOW_NEWSLETTER_STATUS_BAR',
          false,
        );
      });
    });

    describe('Later action', () => {
      it('should keep status bar visible when Later is clicked', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockShowInformationMessage.mockResolvedValue('Later' as any);

        await commandHandler();

        expect(mockOpenExternal).not.toHaveBeenCalled();
        expect(mockStatusBarItem.dispose).not.toHaveBeenCalled();
        expect(mockDisposable.dispose).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      });
    });

    describe('No selection (ESC)', () => {
      it('should keep status bar visible when no selection is made', async () => {
        mockShowInformationMessage.mockResolvedValue(undefined);

        await commandHandler();

        expect(mockOpenExternal).not.toHaveBeenCalled();
        expect(mockStatusBarItem.dispose).not.toHaveBeenCalled();
        expect(mockDisposable.dispose).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      });
    });

    describe('Unexpected responses', () => {
      it('should handle unexpected button response gracefully', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockShowInformationMessage.mockResolvedValue('Unknown Button' as any);

        await commandHandler();

        expect(mockOpenExternal).not.toHaveBeenCalled();
        expect(mockStatusBarItem.dispose).not.toHaveBeenCalled();
        expect(mockDisposable.dispose).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      });
    });
  });

  describe('Multiple instances', () => {
    it('should create unique command IDs for multiple instances', () => {
      const originalDateNow = Date.now;
      let timeCounter = 1000;
      Date.now = jest.fn(() => timeCounter++);

      try {
        showNewsletterStatusBar(context);
        const firstCommandId = mockRegisterCommand.mock.calls[0][0];

        jest.clearAllMocks();
        mockCreateStatusBarItem.mockReturnValue({
          ...mockStatusBarItem,
          show: jest.fn(),
          dispose: jest.fn(),
        });
        mockRegisterCommand.mockReturnValue({ dispose: jest.fn() });

        showNewsletterStatusBar(context);
        const secondCommandId = mockRegisterCommand.mock.calls[0][0];

        expect(firstCommandId).not.toBe(secondCommandId);
        expect(firstCommandId).toMatch(/^turbo\.newsletterCta\.1000$/);
        expect(secondCommandId).toMatch(/^turbo\.newsletterCta\.1001$/);
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe('Error handling', () => {
    it('should handle status bar creation errors gracefully', () => {
      mockCreateStatusBarItem.mockImplementation(() => {
        throw new Error('Status bar creation failed');
      });

      expect(() => showNewsletterStatusBar(context)).toThrow(
        'Status bar creation failed',
      );
    });

    it('should handle command registration errors gracefully', () => {
      mockRegisterCommand.mockImplementation(() => {
        throw new Error('Command registration failed');
      });

      expect(() => showNewsletterStatusBar(context)).toThrow(
        'Command registration failed',
      );
    });

    it('should handle external URL opening errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(); // ⛔ Silence console.warn

      showNewsletterStatusBar(context);
      const commandHandler = mockRegisterCommand.mock
        .calls[0][1] as () => Promise<void>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockShowInformationMessage.mockResolvedValue('Join Newsletter' as any);
      mockOpenExternal.mockImplementation(() => {
        throw new Error('Failed to open external URL');
      });

      // Should not throw since we're handling the error gracefully
      await expect(commandHandler()).resolves.not.toThrow();

      // Resources should still be disposed despite the error
      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
      expect(mockDisposable.dispose).toHaveBeenCalled();
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'SHOULD_SHOW_NEWSLETTER_STATUS_BAR',
        false,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Resource cleanup', () => {
    it('should properly dispose all resources when extension deactivates', () => {
      showNewsletterStatusBar(context);

      // Simulate extension deactivation by calling dispose on all subscriptions
      context.subscriptions.forEach((subscription) => {
        subscription.dispose();
      });

      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });
  });
});
