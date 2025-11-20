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
  let editorChangeCallback: (editor?: vscode.TextEditor) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock vscode.window.onDidChangeActiveTextEditor
    mockOnDidChangeActiveTextEditor = jest.fn((callback) => {
      editorChangeCallback = callback;
      return { dispose: jest.fn() };
    });
    (vscode.window.onDidChangeActiveTextEditor as jest.Mock) =
      mockOnDidChangeActiveTextEditor;

    // Mock extension version
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: { version: '3.10.0' },
    });

    // Default: free user, notification not shown yet
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
  });

  it('should not register listener for Pro users', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(true);

    listenToPhpFileOpenings(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockOnDidChangeActiveTextEditor).not.toHaveBeenCalled();
  });

  it('should register onDidChangeActiveTextEditor listener for free users', () => {
    const context = makeExtensionContext();
    mockIsProUser.mockReturnValue(false);

    listenToPhpFileOpenings(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledTimes(1);
    expect(mockOnDidChangeActiveTextEditor).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should show notification when PHP file is opened for the first time', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context);

    // Simulate user opening a PHP file
    editorChangeCallback(mockEditor);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
      true,
    );
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      '3.10.0',
      context,
    );
  });

  it('should not show notification when notification was already shown', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(true); // Already shown
    mockIsPhpFile.mockReturnValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context);

    await editorChangeCallback(mockEditor);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(mockIsPhpFile).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when non-PHP file is opened', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(false); // Not a PHP file

    const mockDocument = { languageId: 'javascript' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context);

    editorChangeCallback(mockEditor);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should not show notification when editor is undefined', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);

    listenToPhpFileOpenings(context);

    editorChangeCallback(undefined);

    expect(mockReadFromGlobalState).not.toHaveBeenCalled();
    expect(mockIsPhpFile).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should add disposable to context subscriptions', () => {
    const context = makeExtensionContext();
    const mockDisposable = { dispose: jest.fn() };
    const pushSpy = jest.spyOn(context.subscriptions, 'push');
    mockOnDidChangeActiveTextEditor.mockReturnValue(mockDisposable);

    listenToPhpFileOpenings(context);

    expect(pushSpy).toHaveBeenCalledWith(mockDisposable);
  });

  it('should show notification only once even if multiple PHP files are opened', async () => {
    const context = makeExtensionContext();
    let notificationShown = false;
    mockReadFromGlobalState.mockImplementation(() => notificationShown);
    mockIsPhpFile.mockReturnValue(true);
    mockWriteToGlobalState.mockImplementation(() => {
      notificationShown = true;
    });

    const mockDocument1 = {
      languageId: 'php',
      fileName: 'file1.php',
    } as vscode.TextDocument;
    const mockEditor1 = { document: mockDocument1 } as vscode.TextEditor;

    const mockDocument2 = {
      languageId: 'php',
      fileName: 'file2.php',
    } as vscode.TextDocument;
    const mockEditor2 = { document: mockDocument2 } as vscode.TextEditor;

    listenToPhpFileOpenings(context);

    // Open first PHP file
    editorChangeCallback(mockEditor1);

    expect(mockShowNotification).toHaveBeenCalledTimes(1);

    // Open second PHP file
    editorChangeCallback(mockEditor2);

    // Should still be called only once
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
  });

  it('should handle missing extension version gracefully', async () => {
    const context = makeExtensionContext();
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    listenToPhpFileOpenings(context);

    editorChangeCallback(mockEditor);

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      undefined,
      context,
    );
  });
});
