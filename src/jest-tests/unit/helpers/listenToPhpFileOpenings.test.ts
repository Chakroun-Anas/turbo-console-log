import * as vscode from 'vscode';
import { listenToPhpFileOpenings } from '@/helpers/listenToPhpFileOpenings';
import {
  readFromGlobalState,
  writeToGlobalState,
  isPhpFile,
  isProUser,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isPhpFile: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('vscode', () => ({
  window: {
    onDidChangeActiveTextEditor: jest.fn(),
  },
  extensions: {
    getExtension: jest.fn(),
  },
}));

describe('listenToPhpFileOpenings', () => {
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
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;

  let mockOnDidChangeActiveTextEditor: jest.Mock;
  let mockDisposable: { dispose: jest.Mock };
  let editorChangeCallback: (editor?: vscode.TextEditor) => Promise<void>;
  const testVersion = '3.10.0';

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

    // Default: free user, notification not shown yet
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
  });

  it('should not register listener for Pro users', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(true);

    listenToPhpFileOpenings(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should not register listener when notification already shown', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(true); // Already shown

    listenToPhpFileOpenings(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users who have not seen notification', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false); // Not shown yet

    listenToPhpFileOpenings(context, testVersion);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should show notification when PHP file is opened for the first time', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context, testVersion);

    // Simulate user opening a PHP file
    await editorChangeCallback(mockEditor);

    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      testVersion,
      context,
    );
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
      true,
    );
  });

  it('should dispose listener after successfully showing notification', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
  });

  it('should not show notification when non-PHP file is opened', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(false); // Not a PHP file

    const mockDocument = { languageId: 'javascript' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when editor is undefined', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);

    listenToPhpFileOpenings(context, testVersion);

    await editorChangeCallback(undefined);

    expect(mockIsPhpFile).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should add disposable to context subscriptions', () => {
    const context = makeExtensionContext();
    const pushSpy = jest.spyOn(context.subscriptions, 'push');

    listenToPhpFileOpenings(context, testVersion);

    expect(pushSpy).toHaveBeenCalledWith(mockDisposable);
  });

  it('should stop listening after notification is shown (disposal prevents further calls)', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(true);

    const mockDocument1 = {
      languageId: 'php',
      fileName: 'file1.php',
    } as vscode.TextDocument;
    const mockEditor1 = { document: mockDocument1 } as vscode.TextEditor;

    listenToPhpFileOpenings(context, testVersion);

    // Open first PHP file
    await editorChangeCallback(mockEditor1);

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);

    // Listener is disposed, so second call won't happen in real scenario
    // This test just verifies disposal was called
  });

  it('should not mark as shown or dispose when notification is blocked by cooldown', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context, testVersion);

    await editorChangeCallback(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      testVersion,
      context,
    );
    // Should NOT mark as shown when notification was blocked
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    // Should NOT dispose listener (keep trying)
    expect(mockDisposable.dispose).not.toHaveBeenCalled();
  });
});
