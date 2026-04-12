import * as vscode from 'vscode';
import { jsMessyFileHandler } from '@/helpers/listenToJSMessyFileDetection';
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

describe('jsMessyFileHandler', () => {
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
      logFunction: 'console.log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as unknown as ReturnType<typeof getExtensionProperties>);
  });

  it('should not register handler for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    const result = jsMessyFileHandler.shouldRegister(context);

    expect(result).toBe(false);
  });

  it('should not register handler when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    const result = jsMessyFileHandler.shouldRegister(context);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
    );
    expect(result).toBe(false);
  });

  it('should register handler for free users who have not seen notification', () => {
    const result = jsMessyFileHandler.shouldRegister(context);

    expect(result).toBe(true);
  });

  it('should show notification when messy JS/TS file is opened (10+ logs)', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(
      Array(15).fill({ spaces: 2, lines: [] }), // 15 logs
    );
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      languageId: 'typescript',
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = jsMessyFileHandler.shouldProcess(mockEditor, context);
    expect(shouldProcess).toBe(true);

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mockDocument);
    expect(mockDetectAll).toHaveBeenCalledWith(
      expect.anything(), // fs
      expect.anything(), // vscode
      '/path/to/file.ts',
      'console.log',
      '🚀',
      '~',
    );
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_JS_MESSY_FILE,
      testVersion,
      context,
    );
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
      true,
    );
    expect(result).toBe(true);
  });

  it('should return true when successfully showing notification', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file.js' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(result).toBe(true);
  });

  it('should not show notification when file has fewer than 10 logs', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(
      Array(5).fill({ spaces: 2, lines: [] }), // Only 5 logs
    );

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockDetectAll).toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should not process when non-JS/TS file is opened', () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false); // Not a JS/TS file

    const mockDocument = {
      languageId: 'python',
      uri: { fsPath: '/path/to/file.py' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = jsMessyFileHandler.shouldProcess(mockEditor, context);

    expect(shouldProcess).toBe(false);
    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mockDocument);
  });

  it('should not process when file path is undefined', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

    const mockDocument = {
      uri: { fsPath: '' }, // Empty path
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = jsMessyFileHandler.shouldProcess(mockEditor, context);

    expect(shouldProcess).toBe(false);
    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should have a unique handler id', () => {
    expect(jsMessyFileHandler.id).toBe('jsMessyFile');
  });

  it('should handle detectAll errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Turbo Console Log] Error detecting messy file logs:',
      expect.any(Error),
    );
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(result).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should successfully process and show notification', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(12).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file1.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should not mark as shown when notification is blocked by cooldown', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_JS_MESSY_FILE,
      testVersion,
      context,
    );
    // Should NOT mark as shown when notification was blocked
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should detect Vue files as valid JS/TS files', async () => {
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      languageId: 'vue',
      uri: { fsPath: '/path/to/Component.vue' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = jsMessyFileHandler.shouldProcess(mockEditor, context);
    expect(shouldProcess).toBe(true);

    const result = await jsMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mockDocument);
    expect(mockShowNotification).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
