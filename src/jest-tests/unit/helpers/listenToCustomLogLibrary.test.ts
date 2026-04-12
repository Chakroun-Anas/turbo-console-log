import * as vscode from 'vscode';
import { customLogLibraryHandler } from '@/helpers/listenToCustomLogLibrary';
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

describe('customLogLibraryHandler', () => {
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

  let context: vscode.ExtensionContext;
  const testVersion = '3.16.0';

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Default: free user, notification not shown yet
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
    mockShowNotification.mockResolvedValue(true);
  });

  it('should not register handler for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    const result = customLogLibraryHandler.shouldRegister(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(result).toBe(false);
  });

  it('should not register handler when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    const result = customLogLibraryHandler.shouldRegister(context);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_CUSTOM_LOG_LIBRARY_NOTIFICATION,
    );
    expect(result).toBe(false);
  });

  it('should register handler for free users who have not seen notification', () => {
    const result = customLogLibraryHandler.shouldRegister(context);

    expect(result).toBe(true);
  });

  describe('JavaScript/TypeScript library detection', () => {
    it('should detect winston import statement', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'import winston from "winston";\nlogger.info("test")',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

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
      expect(result).toBe(true);
    });

    it('should detect winston require statement', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('const winston = require("winston");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect pino library', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue('import pino from "pino";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect bunyan library', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue('const bunyan = require("bunyan");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect loglevel library', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue('import log from "loglevel";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect debug library', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue('import debug from "debug";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect log4js library', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue('const log4js = require("log4js");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect signale library', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('import { Signale } from "signale";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('PHP library detection', () => {
    it('should detect Monolog use statement', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'use Monolog\\Logger;\nuse Monolog\\Handler\\StreamHandler;',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should detect Monolog instantiation', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('$log = new Monolog\\Logger("channel");'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Notification lifecycle', () => {
    it('should not show notification when no logging library detected', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'console.log("regular code");\nconst x = 5;\nfunction test() {}',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(false);
    });

    it('should not process when editor is undefined', () => {
      const result = customLogLibraryHandler.shouldProcess(
        undefined as unknown as vscode.TextEditor,
        context,
      );

      expect(result).toBe(false);
    });

    it('should not mark as shown when notification blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      const mockDocument = {
        getText: jest.fn().mockReturnValue('import winston from "winston";'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle files with multiple logging libraries (detects first match)', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'import winston from "winston";\nimport pino from "pino";',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should handle single quotes in import statements', async () => {
      const mockDocument = {
        getText: jest.fn().mockReturnValue("import winston from 'winston';"),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle require with extra whitespace', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('const winston = require(   "winston"   );'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(true);

      const result = await customLogLibraryHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not match library names in comments', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue('// TODO: consider using winston for logging'),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(false);
    });

    it('should not match library names in string literals', async () => {
      const mockDocument = {
        getText: jest
          .fn()
          .mockReturnValue(
            'console.log("winston is a great logging library");',
          ),
      } as unknown as vscode.TextDocument;
      const mockEditor = { document: mockDocument } as vscode.TextEditor;

      const shouldProcess = customLogLibraryHandler.shouldProcess(
        mockEditor,
        context,
      );
      expect(shouldProcess).toBe(false);
    });
  });
});
