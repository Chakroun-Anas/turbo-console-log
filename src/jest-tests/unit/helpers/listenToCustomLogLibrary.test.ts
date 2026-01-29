import * as vscode from 'vscode';
import { listenToCustomLogLibrary } from '@/helpers/listenToCustomLogLibrary';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

interface MockVSCodeWindow {
  onDidChangeActiveTextEditor: jest.Mock;
  activeTextEditor: vscode.TextEditor | undefined;
}

jest.mock('vscode', () => ({
  window: {
    onDidChangeActiveTextEditor: jest.fn(),
    activeTextEditor: undefined,
  },
}));

describe('listenToCustomLogLibrary', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;

  let mockOnDidChangeActiveTextEditor: jest.Mock;
  let mockDisposable: { dispose: jest.Mock };
  let editorChangeCallback: (editor?: vscode.TextEditor) => Promise<void>;
  let mockWindow: MockVSCodeWindow;
  const testVersion = '3.16.0';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock disposable with spy
    mockDisposable = { dispose: jest.fn() };

    // Mock vscode.window.onDidChangeActiveTextEditor
    mockOnDidChangeActiveTextEditor = jest.fn((callback) => {
      editorChangeCallback = callback;
      return mockDisposable;
    });
    
    mockWindow = vscode.window as unknown as MockVSCodeWindow;
    mockWindow.onDidChangeActiveTextEditor = mockOnDidChangeActiveTextEditor;

    // Reset active editor
    mockWindow.activeTextEditor = undefined;

    // Default: free user, notification not shown yet
    // Reset to return false (will be overridden in specific tests)
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
    mockShowNotification.mockResolvedValue(true);
  });

  describe('Initial checks and setup', () => {
    it('should not register listener for Pro users', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(true);

      listenToCustomLogLibrary(context, testVersion);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
    });

    it('should not register listener when notification already shown', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(true); // Already shown

      listenToCustomLogLibrary(context, testVersion);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
      );
      expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
    });

    it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false); // Not shown yet

      listenToCustomLogLibrary(context, testVersion);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
      );
      expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
      expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should check active editor on activation if one exists', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'import winston from "winston";\nlogger.info("test")',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      // Set active editor before activation
      mockWindow.activeTextEditor = mockEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Wait for async check
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockDocument.getText).toHaveBeenCalled();
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_CUSTOM_LOG_LIBRARY,
        testVersion,
        context,
      );
    });

    it('should not throw when no active editor on activation', () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);

      // No active editor
      mockWindow.activeTextEditor = undefined;

      expect(() =>
        listenToCustomLogLibrary(context, testVersion),
      ).not.toThrow();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('JavaScript/TypeScript library detection', () => {
    it('should detect winston import statement', async () => {
      const context = makeExtensionContext();
      // Mock returns false for all checks (notification not shown)
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'import winston from "winston";\nlogger.info("test")',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_CUSTOM_LOG_LIBRARY,
        testVersion,
        context,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
        true,
      );
    });

    it('should detect winston require statement', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('const winston = require("winston");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect pino library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import pino from "pino";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect bunyan library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('const bunyan = require("bunyan");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect loglevel library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import log from "loglevel";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect debug library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import debug from "debug";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect log4js library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('const log4js = require("log4js");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect signale library', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('import { Signale } from "signale";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });
  });

  describe('PHP library detection', () => {
    it('should detect Monolog use statement', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'use Monolog\\Logger;\nuse Monolog\\Handler\\StreamHandler;',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect Monolog instantiation', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('$log = new Monolog\\Logger("channel");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });
  });

  describe('Notification lifecycle', () => {
    it('should not show notification when no logging library detected', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'console.log("regular code");\nconst x = 5;\nfunction test() {}',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('should not mark as shown when notification blocked by cooldown', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import winston from "winston";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('should dispose listener after successfully showing notification', async () => {
      const context = makeExtensionContext();
      // First calls: not shown, second call after notification: already shown
      mockReadFromGlobalState
        .mockReturnValueOnce(false) // Initial check in main function
        .mockReturnValueOnce(false) // First callback check
        .mockReturnValueOnce(true); // Second callback check (after writeToGlobalState)
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import pino from "pino";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      // First callback - shows notification
      await editorChangeCallback(mockEditor);

      // Notification was shown and writeToGlobalState was called
      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).toHaveBeenCalled();

      // Second callback - should detect already shown and dispose
      await editorChangeCallback(mockEditor);

      expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('should stop listening when notification already shown (checked on editor change)', async () => {
      const context = makeExtensionContext();
      // First call: not shown, second call: already shown
      mockReadFromGlobalState
        .mockReturnValueOnce(false) // Initial check
        .mockReturnValueOnce(true); // On editor change

      listenToCustomLogLibrary(context, testVersion);

      await editorChangeCallback(undefined);

      expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not process when editor is undefined', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);

      listenToCustomLogLibrary(context, testVersion);

      await editorChangeCallback(undefined);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle files with multiple logging libraries (detects first match)', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'import winston from "winston";\nimport pino from "pino";',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });

    it('should handle single quotes in import statements', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest.fn().mockReturnValue("import winston from 'winston';"),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should handle require with extra whitespace', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('const winston = require(   "winston"   );'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      // Set active editor before triggering callback
      mockWindow.activeTextEditor = mockEditor;

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should not match library names in comments', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('// TODO: consider using winston for logging'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not match library names in string literals', async () => {
      const context = makeExtensionContext();
      mockReadFromGlobalState.mockReturnValue(false);

      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'console.log("winston is a great logging library");',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      listenToCustomLogLibrary(context, testVersion);

      await editorChangeCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });
});
