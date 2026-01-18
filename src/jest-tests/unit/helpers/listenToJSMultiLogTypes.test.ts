import * as vscode from 'vscode';
import { listenToJSMultiLogTypes } from '@/helpers/listenToJSMultiLogTypes';
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

describe('listenToJSMultiLogTypes', () => {
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
  const mockOnDidChangeActiveTextEditor = vscode.window
    .onDidChangeActiveTextEditor as jest.MockedFunction<
    typeof vscode.window.onDidChangeActiveTextEditor
  >;
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

  it('should not register listener for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should not register listener when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
    const disposable = { dispose: jest.fn() };
    mockOnDidChangeActiveTextEditor.mockReturnValue(
      disposable as unknown as vscode.Disposable,
    );

    const pushSpy = jest.spyOn(context.subscriptions, 'push');

    listenToJSMultiLogTypes(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(pushSpy).toHaveBeenCalledWith(disposable);
  });

  it('should show notification when file has 2+ different log types', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.error' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
      mockEditor.document,
    );
    expect(mockDetectAll).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_JS_MULTI_LOG_TYPES,
      testVersion,
      context,
    );
  });

  it('should dispose listener after successfully showing notification', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.warn' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
      true,
    );
    expect(disposable.dispose).toHaveBeenCalled();
  });

  it('should not show notification when file has only 1 log type', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.log' },
    ]);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
  });

  it('should detect 3 different log types', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.error' },
      { spaces: '', lines: [], logFunction: 'console.warn' },
      { spaces: '', lines: [], logFunction: 'console.log' }, // Duplicate
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).toHaveBeenCalled();
  });

  it('should not show notification when non-JS/TS file is opened', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.py' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when editor is undefined', async () => {
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return { dispose: jest.fn() } as unknown as vscode.Disposable;
    });

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(undefined);

    expect(mockIsJavaScriptOrTypeScriptFile).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when file path is undefined', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should add disposable to context subscriptions', () => {
    const disposable = { dispose: jest.fn() };
    mockOnDidChangeActiveTextEditor.mockReturnValue(
      disposable as unknown as vscode.Disposable,
    );

    const pushSpy = jest.spyOn(context.subscriptions, 'push');

    listenToJSMultiLogTypes(context, testVersion);

    expect(pushSpy).toHaveBeenCalledWith(disposable);
  });

  it('should handle detectAll errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Turbo Console Log] Error detecting multi-type logs:',
      expect.any(Error),
    );
    expect(mockShowNotification).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should stop listening after notification is shown (disposal prevents further calls)', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.error' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    // First call - should show notification
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(disposable.dispose).toHaveBeenCalledTimes(1);

    // Second call - should not show notification (disposable already disposed)
    mockShowNotification.mockClear();
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
  });

  it('should not mark as shown or dispose when notification is blocked by cooldown', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [], logFunction: 'console.error' },
    ]);
    mockShowNotification.mockResolvedValue(false); // Cooldown blocked

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(disposable.dispose).not.toHaveBeenCalled();
  });

  it('should handle messages without logFunction property', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'console.log' },
      { spaces: '', lines: [] }, // No logFunction
      { spaces: '', lines: [], logFunction: 'console.error' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToJSMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    // Should still detect 2 types and show notification
    expect(mockShowNotification).toHaveBeenCalled();
  });
});
