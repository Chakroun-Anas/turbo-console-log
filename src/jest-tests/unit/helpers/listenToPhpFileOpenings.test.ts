import * as vscode from 'vscode';
import { phpFileOpeningsHandler } from '@/helpers/listenToPhpFileOpenings';
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
  extensions: {
    getExtension: jest.fn(),
  },
}));

describe('phpFileOpeningsHandler', () => {
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

  const testVersion = '3.10.0';
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Default: free user, notification not shown yet
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
  });

  it('should not register handler for Pro users', () => {
    mockIsProUser.mockReturnValue(true);

    const result = phpFileOpeningsHandler.shouldRegister(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(result).toBe(false);
  });

  it('should not register handler when notification already shown', () => {
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(true); // Already shown

    const result = phpFileOpeningsHandler.shouldRegister(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(result).toBe(false);
  });

  it('should register handler for free users who have not seen notification', () => {
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false); // Not shown yet

    const result = phpFileOpeningsHandler.shouldRegister(context);

    expect(mockIsProUser).toHaveBeenCalledWith(context);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
    );
    expect(result).toBe(true);
  });

  it('should show notification when PHP file is opened for the first time', async () => {
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const shouldProcess = phpFileOpeningsHandler.shouldProcess(
      mockEditor,
      context,
    );
    expect(shouldProcess).toBe(true);

    const result = await phpFileOpeningsHandler.process(
      mockEditor,
      context,
      testVersion,
    );

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
    expect(result).toBe(true);
  });

  it('should mark notification as shown after successfully displaying it', async () => {
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(true);

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpFileOpeningsHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
      true,
    );
    expect(result).toBe(true);
  });

  it('should not process when non-PHP file is opened', () => {
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(false); // Not a PHP file

    const mockDocument = { languageId: 'javascript' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = phpFileOpeningsHandler.shouldProcess(mockEditor, context);

    expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    expect(result).toBe(false);
  });

  it('should not mark as shown when notification is blocked by cooldown', async () => {
    mockReadFromGlobalState.mockReturnValue(false);
    mockIsPhpFile.mockReturnValue(true);
    mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

    const mockDocument = { languageId: 'php' } as vscode.TextDocument;
    const mockEditor = { document: mockDocument } as vscode.TextEditor;

    const result = await phpFileOpeningsHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
      testVersion,
      context,
    );
    // Should NOT mark as shown when notification was blocked
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
