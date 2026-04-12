import * as vscode from 'vscode';
import { phpMessyFileHandler } from '@/helpers/listenToPhpMessyFileDetection';
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
  workspace: {
    getConfiguration: jest.fn(),
  },
}));

describe('phpMessyFileHandler', () => {
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

  it('should not register handler for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    const result = phpMessyFileHandler.shouldRegister(context);

    expect(result).toBe(false);
  });

  it('should not register handler when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    const result = phpMessyFileHandler.shouldRegister(context);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MESSY_FILE_NOTIFICATION,
    );
    expect(result).toBe(false);
  });

  it('should register handler for free users who have not seen notification', () => {
    const result = phpMessyFileHandler.shouldRegister(context);

    expect(result).toBe(true);
  });

  it('should show notification when messy PHP file is opened (10+ logs)', async () => {
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = phpMessyFileHandler.shouldProcess(
      mockEditor,
      context,
    );
    expect(shouldProcess).toBe(true);

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
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
    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_MESSY_FILE_NOTIFICATION,
      true,
    );
    expect(result).toBe(true);
  });

  it('should return true when successfully showing notification', async () => {
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(15).fill({})); // 15 logs
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(result).toBe(true);
  });

  it('should not show notification when file has fewer than 10 logs', async () => {
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(9).fill({})); // 9 logs

    const mockDocument = {
      uri: { fsPath: '/path/to/file.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockDetectAll).toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should not process when non-PHP file is opened', () => {
    mockIsPhpFile.mockReturnValue(false); // Not a PHP file

    const mockDocument = {
      uri: { fsPath: '/path/to/file.js' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = phpMessyFileHandler.shouldProcess(
      mockEditor,
      context,
    );

    expect(shouldProcess).toBe(false);
    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
  });

  it('should not process when file path is undefined', async () => {
    mockIsPhpFile.mockReturnValue(true);

    const mockDocument = {
      uri: { fsPath: '' }, // Empty path
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = phpMessyFileHandler.shouldProcess(
      mockEditor,
      context,
    );

    expect(shouldProcess).toBe(false);
    expect(mockDetectAll).not.toHaveBeenCalled();
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should have a unique handler id', () => {
    expect(phpMessyFileHandler.id).toBe('phpMessyFile');
  });

  it('should handle detectAll errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    const mockDocument = {
      uri: { fsPath: '/path/to/file.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to detect logs in PHP file "/path/to/file.php":',
      'Detection failed',
    );
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(result).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should successfully process and show notification', async () => {
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(12).fill({})); // 12 logs
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = {
      uri: { fsPath: '/path/to/file1.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should not mark as shown when notification is blocked by cooldown', async () => {
    mockIsPhpFile.mockReturnValue(true);
    mockDetectAll.mockResolvedValue(new Array(10).fill({})); // 10 logs
    mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

    const mockDocument = {
      uri: { fsPath: '/path/to/file.php' },
    } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpMessyFileHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
