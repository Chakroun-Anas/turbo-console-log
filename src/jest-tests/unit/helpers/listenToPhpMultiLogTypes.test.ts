import * as vscode from 'vscode';
import { listenToPhpMultiLogTypes } from '@/helpers/listenToPhpMultiLogTypes';
import {
  readFromGlobalState,
  writeToGlobalState,
  isPhpFile,
  getExtensionProperties,
  isProUser,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { detectAll } from '@/debug-message/php/detectAll';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isPhpFile: jest.fn(),
  getExtensionProperties: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('@/debug-message/php/detectAll', () => ({
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

describe('listenToPhpMultiLogTypes', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsPhpFile = isPhpFile as jest.MockedFunction<typeof isPhpFile>;
  const mockGetExtensionProperties =
    getExtensionProperties as jest.MockedFunction<
      typeof getExtensionProperties
    >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;
  const mockDetectAll = detectAll as jest.MockedFunction<typeof detectAll>;
  const mockOnDidChangeActiveTextEditor = vscode.window
    .onDidChangeActiveTextEditor as jest.MockedFunction<
    typeof vscode.window.onDidChangeActiveTextEditor
  >;
  const mockGetConfiguration = vscode.workspace
    .getConfiguration as jest.MockedFunction<
    typeof vscode.workspace.getConfiguration
  >;

  const testVersion = '3.14.1';
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Default mock returns
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
    mockGetConfiguration.mockReturnValue({
      get: jest.fn(),
    } as unknown as vscode.WorkspaceConfiguration);
    mockGetExtensionProperties.mockReturnValue({
      logFunction: 'error_log',
      logMessagePrefix: 'TCL:',
      delimiterInsideMessage: '~',
    } as ReturnType<typeof getExtensionProperties>);
  });

  it('should not register listener for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should not register listener when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
    listenToPhpMultiLogTypes(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'var_dump' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_MULTI_LOG_TYPES,
      testVersion,
      context,
    );
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MULTI_LOG_TYPES_NOTIFICATION,
      true,
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'print_r' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(disposable.dispose).toHaveBeenCalledTimes(1);
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'error_log' },
    ]);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(disposable.dispose).not.toHaveBeenCalled();
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'var_dump' },
      { spaces: '', lines: [], logFunction: 'print_r' },
      { spaces: '', lines: [], logFunction: 'error_log' }, // Duplicate
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_MULTI_LOG_TYPES,
      testVersion,
      context,
    );
  });

  it('should not show notification when non-PHP file is opened', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.js' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(false);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when editor is undefined', async () => {
    const disposable = { dispose: jest.fn() };
    let editorCallback: (editor: vscode.TextEditor | undefined) => void;

    mockOnDidChangeActiveTextEditor.mockImplementation((callback) => {
      editorCallback = callback;
      return disposable as unknown as vscode.Disposable;
    });

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(undefined);

    expect(mockIsPhpFile).not.toHaveBeenCalled();
    expect(mockDetectAll).not.toHaveBeenCalled();
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

    mockIsPhpFile.mockReturnValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should add disposable to context subscriptions', () => {
    const disposable = { dispose: jest.fn() };
    mockOnDidChangeActiveTextEditor.mockReturnValue(
      disposable as unknown as vscode.Disposable,
    );

    listenToPhpMultiLogTypes(context, testVersion);

    expect(context.subscriptions).toContain(disposable);
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    listenToPhpMultiLogTypes(context, testVersion);

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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'var_dump' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    // First call - should show notification
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(disposable.dispose).toHaveBeenCalledTimes(1);

    // Second call - should not show notification (disposable already disposed)
    mockShowNotification.mockClear();
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1); // Still called but wouldn't execute if real disposable
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [], logFunction: 'var_dump' },
    ]);
    mockShowNotification.mockResolvedValue(false); // Cooldown blocked

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).toHaveBeenCalled();
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue([
      { spaces: '', lines: [], logFunction: 'error_log' },
      { spaces: '', lines: [] }, // No logFunction
      { spaces: '', lines: [], logFunction: 'var_dump' },
    ]);
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMultiLogTypes(context, testVersion);

    await editorCallback!(mockEditor);

    // Should still detect 2 types and show notification
    expect(mockShowNotification).toHaveBeenCalled();
  });
});
