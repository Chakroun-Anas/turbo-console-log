import { listenToLogsInTestFile } from '@/helpers/listenToLogsInTestFile';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { GlobalStateKey } from '@/entities';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

// Mock dependencies
jest.mock('@/debug-message/js/JSDebugMessage/detectAll/detectAll');
jest.mock('@/notifications/showNotification');
jest.mock('@/helpers/isProUser');
jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/helpers/isJavaScriptOrTypeScriptFile');
jest.mock('@/helpers/getExtensionProperties');
jest.mock('vscode', () => ({
  window: {
    onDidChangeActiveTextEditor: jest.fn(),
    activeTextEditor: undefined,
  },
  workspace: {
    getConfiguration: jest.fn(),
  },
}));

const mockDetectAll = detectAll as jest.MockedFunction<typeof detectAll>;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

import { isProUser } from '@/helpers/isProUser';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { isJavaScriptOrTypeScriptFile } from '@/helpers/isJavaScriptOrTypeScriptFile';
import { getExtensionProperties } from '@/helpers/getExtensionProperties';

const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockIsJavaScriptOrTypeScriptFile =
  isJavaScriptOrTypeScriptFile as jest.MockedFunction<
    typeof isJavaScriptOrTypeScriptFile
  >;
const mockGetExtensionProperties =
  getExtensionProperties as jest.MockedFunction<typeof getExtensionProperties>;

interface MockVSCodeWindow {
  activeTextEditor?: vscode.TextEditor;
  onDidChangeActiveTextEditor: jest.Mock;
}

describe('listenToLogsInTestFile', () => {
  let mockContext: vscode.ExtensionContext;
  let mockWindow: MockVSCodeWindow;
  let listeners: Array<
    (editor: vscode.TextEditor | undefined) => void | Promise<void>
  >;
  let disposables: Array<vscode.Disposable>;
  const version = '3.15.0';

  beforeEach(() => {
    jest.clearAllMocks();

    listeners = [];
    disposables = [];

    // Mock context
    mockContext = {
      subscriptions: {
        push: jest.fn((disposable: vscode.Disposable) => {
          disposables.push(disposable);
        }),
      },
    } as unknown as vscode.ExtensionContext;

    // Mock window with listener registration
    mockWindow = vscode.window as unknown as MockVSCodeWindow;
    mockWindow.onDidChangeActiveTextEditor = jest.fn((listener) => {
      listeners.push(listener);
      return {
        dispose: jest.fn(),
      };
    });
    mockWindow.activeTextEditor = undefined;

    // Default mocks
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(undefined);
    mockGetExtensionProperties.mockReturnValue({
      logFunction: 'log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as never);
  });

  describe('Activation Guards', () => {
    it('should not listen if user is Pro', () => {
      mockIsProUser.mockReturnValue(true);

      listenToLogsInTestFile(mockContext, version);

      expect(mockWindow.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
    });

    it('should not listen if notification has already been shown', () => {
      mockReadFromGlobalState.mockReturnValue(true);

      listenToLogsInTestFile(mockContext, version);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
      );
      expect(mockWindow.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
    });

    it('should listen if user is free and notification not shown', () => {
      listenToLogsInTestFile(mockContext, version);

      expect(mockWindow.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions.push).toHaveBeenCalled();
    });
  });

  describe('Test File Detection', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should detect .test.ts files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/path/to/file.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_LOGS_IN_TEST_FILE,
        version,
        mockContext,
      );
    });

    it('should detect .spec.js files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/path/to/file.spec.js' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect .test.tsx files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/components/Button.test.tsx' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect .spec.jsx files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/src/App.spec.jsx' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect files in __tests__ directory', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/src/__tests__/utils.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect .test.php files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/tests/UserTest.test.php' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should detect .spec.php files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("test 1");',
        'console.log("test 2");',
        'console.log("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/tests/Feature/AuthSpec.spec.php' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should NOT detect regular files', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument(['console.log("not a test");']);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/src/utils/helpers.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockDetectAll).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Log Threshold', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should show notification when test file has 3 logs (threshold)', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("log 1");',
        'console.log("log 2");',
        'console.log("log 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/app.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should show notification when test file has more than 3 logs', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("log 1");',
        'console.log("log 2");',
        'console.log("log 3");',
        'console.log("log 4");',
        'console.log("log 5");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/integration.spec.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
        { line: 3 },
        { line: 4 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should NOT show notification when test file has less than 3 logs', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("log 1");',
        'console.log("log 2");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/small.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([{ line: 0 }, { line: 1 }] as never);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should NOT show notification when test file has 0 logs', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument(['it("should work", () => {});']);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/clean.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([] as never);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined editor gracefully', async () => {
      listenToLogsInTestFile(mockContext, version);

      await listeners[0](undefined);

      expect(mockDetectAll).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should skip non-JS/TS files', async () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument(['some text']);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/file.test.txt' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockDetectAll).not.toHaveBeenCalled();
    });

    it('should handle detectAll throwing error', async () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument(['console.log("test");']);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/error.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockRejectedValue(new Error('Parse error'));

      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await listeners[0](mockWindow.activeTextEditor);

      expect(consoleError).toHaveBeenCalledWith(
        'Error detecting logs in test file:',
        expect.any(Error),
      );
      expect(mockShowNotification).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should handle missing fsPath gracefully', async () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument(['console.log("test");']);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockDetectAll).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should call writeToGlobalState when notification is shown', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("1");',
        'console.log("2");',
        'console.log("3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/file.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_LOGS_IN_TEST_FILE_NOTIFICATION,
        true,
      );
    });

    it('should NOT call writeToGlobalState when notification was not shown', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("1");',
        'console.log("2");',
        'console.log("3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/file.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(false);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('should dispose listener after showing notification', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("1");',
        'console.log("2");',
        'console.log("3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/file.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      const disposable = disposables[0];
      const disposeSpy = jest.spyOn(disposable, 'dispose');

      await listeners[0](mockWindow.activeTextEditor);

      expect(disposeSpy).toHaveBeenCalled();
    });

    it('should NOT dispose listener if notification was not shown (cooldown)', async () => {
      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'console.log("1");',
        'console.log("2");',
        'console.log("3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/file.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(false);

      const disposable = disposables[0];
      const disposeSpy = jest.spyOn(disposable, 'dispose');

      await listeners[0](mockWindow.activeTextEditor);

      expect(disposeSpy).not.toHaveBeenCalled();
    });
  });

  describe('detectAll Configuration', () => {
    beforeEach(() => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should call detectAll with correct parameters', async () => {
      const customConfig = {
        logFunction: 'customLog',
        logMessagePrefix: '✨',
        delimiterInsideMessage: '|',
      };
      mockGetExtensionProperties.mockReturnValue(customConfig as never);

      listenToLogsInTestFile(mockContext, version);

      const document = makeTextDocument([
        'customLog("test 1");',
        'customLog("test 2");',
        'customLog("test 3");',
      ]);
      Object.defineProperty(document, 'uri', {
        value: { fsPath: '/test/custom.test.ts' },
      });

      mockWindow.activeTextEditor = {
        document,
      } as vscode.TextEditor;

      mockDetectAll.mockResolvedValue([
        { line: 0 },
        { line: 1 },
        { line: 2 },
      ] as never);
      mockShowNotification.mockResolvedValue(true);

      await listeners[0](mockWindow.activeTextEditor);

      expect(mockDetectAll).toHaveBeenCalledWith(
        fs,
        vscode,
        '/test/custom.test.ts',
        'customLog',
        '✨',
        '|',
      );
    });
  });
});
