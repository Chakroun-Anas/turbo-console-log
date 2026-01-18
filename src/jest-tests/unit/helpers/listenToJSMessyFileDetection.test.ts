import * as vscode from 'vscode';
import { listenToJSMessyFileDetection } from '@/helpers/listenToJSMessyFileDetection';
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
  window: {
    onDidChangeActiveTextEditor: jest.fn(),
  },
  workspace: {
    getConfiguration: jest.fn(),
  },
}));

describe('listenToJSMessyFileDetection', () => {
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

  let mockOnDidChangeActiveTextEditor: jest.Mock;
  let mockDisposable: { dispose: jest.Mock };
  let editorChangeCallback: (editor?: vscode.TextEditor) => Promise<void>;
  const testVersion = '3.14.1';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock disposable with spy
    mockDisposable = { dispose: jest.fn() };

    // Mock vscode.window.onDidChangeActiveTextEditor
    mockOnDidChangeActiveTextEditor = jest.fn((callback) => {
      editorChangeCallback = callback;
      return mockDisposable;
    });
    (vscode.window.onDidChangeActiveTextEditor as jest.Mock) =
      mockOnDidChangeActiveTextEditor;

    // Mock workspace configuration
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({});
    mockGetExtensionProperties.mockReturnValue({
      logFunction: 'console.log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as unknown as ReturnType<typeof getExtensionProperties>);

    // Default: free user, notification not shown yet
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
  });

  it('should not register listener for Pro users', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(true);

    listenToJSMessyFileDetection(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should not register listener when notification already shown', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(true); // Already shown

    listenToJSMessyFileDetection(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false); // Not shown yet

    listenToJSMessyFileDetection(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MESSY_FILE_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should show notification when messy JS/TS file is opened (10+ logs)', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
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

    listenToJSMessyFileDetection(context, testVersion);

    // Simulate user opening a messy file
    await editorChangeCallback(mockEditor);

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
  });

  it('should dispose listener after successfully showing notification', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file.js' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
  });

  it('should not show notification when file has fewer than 10 logs', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(
      Array(5).fill({ spaces: 2, lines: [] }), // Only 5 logs
    );

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockDetectAll).toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
  });

  it('should not show notification when non-JS/TS file is opened', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false); // Not a JS/TS file

    const mockDocument = {
      languageId: 'python',
      uri: { fsPath: '/path/to/file.py' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mockDocument);
    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when editor is undefined', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(undefined);

    expect(mockIsJavaScriptOrTypeScriptFile).not.toHaveBeenCalled();
    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when file path is undefined', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

    const mockDocument = {
      uri: { fsPath: '' }, // Empty path
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should add disposable to context subscriptions', () => {
    const context = makeExtensionContext();
    const pushSpy = jest.spyOn(context.subscriptions, 'push');

    listenToJSMessyFileDetection(context, testVersion);

    expect(pushSpy).toHaveBeenCalledWith(mockDisposable);
  });

  it('should handle detectAll errors gracefully', async () => {
    const context = makeExtensionContext();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Turbo Console Log] Error detecting messy file:',
      expect.any(Error),
    );
    expect(mockShowNotification).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should stop listening after notification is shown (disposal prevents further calls)', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(12).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file1.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    // Open first messy file
    await editorChangeCallback(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);

    // Listener is disposed, so second call won't happen in real scenario
    // This test just verifies disposal was called
  });

  it('should not mark as shown or dispose when notification is blocked by cooldown', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

    const mockDocument = {
      uri: { fsPath: '/path/to/file.ts' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_JS_MESSY_FILE,
      testVersion,
      context,
    );
    // Should NOT mark as shown when notification was blocked
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    // Should NOT dispose listener (keep trying)
    expect(mockDisposable.dispose).not.toHaveBeenCalled();
  });

  it('should detect Vue files as valid JS/TS files', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(Array(10).fill({ spaces: 2, lines: [] }));
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      languageId: 'vue',
      uri: { fsPath: '/path/to/Component.vue' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToJSMessyFileDetection(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mockDocument);
    expect(mockShowNotification).toHaveBeenCalled();
  });
});
