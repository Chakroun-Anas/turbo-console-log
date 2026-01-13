import * as vscode from 'vscode';
import { listenToPhpMessyFileDetection } from '@/helpers/listenToPhpMessyFileDetection';
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

describe('listenToPhpMessyFileDetection', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;
  const mockIsPhpFile = isPhpFile as jest.MockedFunction<typeof isPhpFile>;
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
      logFunction: 'error_log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as unknown as ReturnType<typeof getExtensionProperties>);
  });

  it('should not register listener for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    listenToPhpMessyFileDetection(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should not register listener when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    listenToPhpMessyFileDetection(context, testVersion);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MESSY_FILE_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
    const disposable = { dispose: jest.fn() };
    mockOnDidChangeActiveTextEditor.mockReturnValue(
      disposable as unknown as vscode.Disposable,
    );

    const pushSpy = jest.spyOn(context.subscriptions, 'push');

    listenToPhpMessyFileDetection(context, testVersion);

    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(pushSpy).toHaveBeenCalledWith(disposable);
  });

  it('should show notification when messy PHP file is opened (10+ logs)', async () => {
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
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockIsPhpFile).toHaveBeenCalledWith(mockEditor.document);
    expect(mockDetectAll).toHaveBeenCalledWith(
      '/path/to/file.php',
      'error_log',
      '🚀',
      '~',
    );
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_MESSY_FILE,
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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MESSY_FILE_NOTIFICATION,
      true,
    );
    expect(disposable.dispose).toHaveBeenCalled();
  });

  it('should not show notification when file has fewer than 10 logs', async () => {
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
    mockDetectAll.mockResolvedValue(new Array(9).fill({})); // 9 logs

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
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

    listenToPhpMessyFileDetection(context, testVersion);

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

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(undefined);

    expect(mockIsPhpFile).not.toHaveBeenCalled();
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

    listenToPhpMessyFileDetection(context, testVersion);

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

    listenToPhpMessyFileDetection(context, testVersion);

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
        uri: { fsPath: '/path/to/file.php' },
      },
    } as vscode.TextEditor;

    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(mockEditor);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to detect logs in PHP file "/path/to/file.php":',
      'Detection failed',
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
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(true);

    listenToPhpMessyFileDetection(context, testVersion);

    // First call - should show notification
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(disposable.dispose).toHaveBeenCalledTimes(1);

    // Second call - should not show notification (disposable already disposed)
    mockShowNotification.mockClear();
    await editorCallback!(mockEditor);
    expect(mockShowNotification).toHaveBeenCalledTimes(1); // Called again, but disposable prevents re-registration
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
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(false); // Cooldown blocked

    listenToPhpMessyFileDetection(context, testVersion);

    await editorCallback!(mockEditor);

    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(disposable.dispose).not.toHaveBeenCalled();
  });
});
