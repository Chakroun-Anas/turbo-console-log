import * as vscode from 'vscode';
import { logsInTestFileHandler } from '@/helpers/listenToLogsInTestFile';
import {
  readFromGlobalState,
  writeToGlobalState,
  isJavaScriptOrTypeScriptFile,
  getExtensionProperties,
  isProUser,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
  getExtensionProperties: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('@/debug-message/js/JSDebugMessage/detectAll/detectAll', () => ({
  detectAll: jest.fn(),
}));

jest.mock('vscode', () => ({
  workspace: {
    getConfiguration: jest.fn(),
  },
}));

describe('logsInTestFileHandler', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;
  const mockIsJavaScriptOrTypeScriptFile =
    isJavaScriptOrTypeScriptFile as jest.MockedFunction<
      typeof isJavaScriptOrTypeScriptFile
    >;
  const mockGetExtensionProperties =
    getExtensionProperties as jest.MockedFunction<
      typeof getExtensionProperties
    >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockDetectAll = detectAll as jest.MockedFunction<typeof detectAll>;
  const mockGetConfiguration = vscode.workspace
    .getConfiguration as jest.MockedFunction<
    typeof vscode.workspace.getConfiguration
  >;

  let context: vscode.ExtensionContext;
  const testVersion = '3.14.1';

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Default mocks
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
    mockGetConfiguration.mockReturnValue({} as vscode.WorkspaceConfiguration);
    mockGetExtensionProperties.mockReturnValue({
      logFunction: 'log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as unknown as ReturnType<typeof getExtensionProperties>);
  });

  describe('shouldRegister', () => {
    it('should not register handler for Pro users', () => {
      mockIsProUser.mockReturnValue(true);

      const result = logsInTestFileHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should not register handler when notification already shown', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      const result = logsInTestFileHandler.shouldRegister(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
      );
      expect(result).toBe(false);
    });

    it('should register handler for free users who have not seen notification', () => {
      const result = logsInTestFileHandler.shouldRegister(context);

      expect(result).toBe(true);
    });
  });

  describe('shouldProcess - Test File Detection', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should process .test.ts files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/path/to/file.test.ts' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process .spec.js files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/path/to/file.spec.js' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process .test.tsx files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/components/Button.test.tsx' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process .spec.jsx files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/src/App.spec.jsx' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process files in __tests__ directory', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/src/__tests__/utils.ts' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process .test.php files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/tests/UserTest.test.php' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should process .spec.php files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/tests/Feature/AuthSpec.spec.php' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(true);
    });

    it('should NOT process regular files', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/src/utils/helpers.ts' },
        },
      } as vscode.TextEditor;

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(false);
    });

    it('should not process when non-JS/TS file is opened', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/file.test.txt' },
        },
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(false);
    });

    it('should not process when file path is undefined', () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '' },
        },
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      const result = logsInTestFileHandler.shouldProcess(mockEditor, context);

      expect(result).toBe(false);
    });
  });

  describe('process - Log Threshold', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should show notification when test file has 3 logs (threshold)', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/app.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_LOGS_IN_TEST_FILE,
        testVersion,
        context,
      );
      expect(result).toBe(true);
    });

    it('should show notification when test file has more than 3 logs', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/integration.spec.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
        { line: 3 },
        { line: 4 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should NOT show notification when test file has less than 3 logs', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/small.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([{ line: 0 }, { line: 1 }] as never);

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should NOT show notification when test file has 0 logs', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/clean.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([] as never);

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('process - Lifecycle Management', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should mark notification as shown after successfully displaying it', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/file.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await logsInTestFileHandler.process(mockEditor, context, testVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
        true,
      );
    });

    it('should NOT call writeToGlobalState when notification was not shown (cooldown)', async () => {
      const mockEditor = {
        document: {
          uri: { fsPath: '/test/file.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(false);

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('process - detectAll Configuration', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should call detectAll with correct parameters', async () => {
      const customConfig = {
        logFunction: 'customLog',
        logMessagePrefix: '✨',
        delimiterInsideMessage: '|',
      };
      mockGetExtensionProperties.mockReturnValue(
        customConfig as unknown as ReturnType<typeof getExtensionProperties>,
      );

      const mockEditor = {
        document: {
          uri: { fsPath: '/test/custom.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await logsInTestFileHandler.process(mockEditor, context, testVersion);

      expect(mockDetectAll).toHaveBeenCalledWith(
        expect.anything(), // fs
        vscode,
        '/test/custom.test.ts',
        'customLog',
        '✨',
        '|',
      );
    });
  });

  describe('process - Error Handling', () => {
    it('should handle detectAll throwing error', async () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockEditor = {
        document: {
          uri: { fsPath: '/test/error.test.ts' },
        },
      } as vscode.TextEditor;

      mockDetectAll.mockRejectedValue(new Error('Parse error'));

      const result = await logsInTestFileHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error detecting logs in test file:',
        expect.any(Error),
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });
});
