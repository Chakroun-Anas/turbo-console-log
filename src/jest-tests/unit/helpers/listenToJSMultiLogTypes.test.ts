import * as vscode from 'vscode';
import { jsMultiLogTypesHandler } from '@/helpers/listenToJSMultiLogTypes';
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

describe('jsMultiLogTypesHandler', () => {
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

    const result = jsMultiLogTypesHandler.shouldRegister(context);

    expect(result).toBe(false);
  });

  it('should not register handler when notification already shown', () => {
    mockReadFromGlobalState.mockReturnValue(true);

    const result = jsMultiLogTypesHandler.shouldRegister(context);

    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
    );
    expect(result).toBe(false);
  });

  it('should register handler for free users who have not seen notification', () => {
    const result = jsMultiLogTypesHandler.shouldRegister(context);

    expect(result).toBe(true);
  });

  it('should show notification when file has 2+ different log types', async () => {
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

    const shouldProcess = jsMultiLogTypesHandler.shouldProcess(
      mockEditor,
      context,
    );
    expect(shouldProcess).toBe(true);

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
      mockEditor.document,
    );
    expect(mockDetectAll).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationEvent.EXTENSION_JS_MULTI_LOG_TYPES,
      testVersion,
      context,
    );
    expect(result).toBe(true);
  });

  it('should mark notification as shown after successfully displaying it', async () => {
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

    await jsMultiLogTypesHandler.process(mockEditor, context, testVersion);

    expect(mockWriteToGlobalState).toHaveBeenCalledWith(
      context,
      GlobalStateKey.HAS_SHOWN_JS_MULTI_LOG_TYPES_NOTIFICATION,
      true,
    );
  });

  it('should not show notification when file has only 1 log type', async () => {
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

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should detect 3 different log types', async () => {
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

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockShowNotification).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not process when non-JS/TS file is opened', () => {
    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.py' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

    const result = jsMultiLogTypesHandler.shouldProcess(mockEditor, context);

    expect(result).toBe(false);
  });

  it('should not process when file path is undefined', () => {
    const mockEditor = {
      document: {
        uri: { fsPath: '' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

    const result = jsMultiLogTypesHandler.shouldProcess(mockEditor, context);

    expect(result).toBe(false);
  });

  it('should handle detectAll errors gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const mockEditor = {
      document: {
        uri: { fsPath: '/path/to/file.ts' },
      },
    } as vscode.TextEditor;

    mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    mockDetectAll.mockRejectedValue(new Error('Detection failed'));

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Turbo Console Log] Error detecting multi-type logs:',
      expect.any(Error),
    );
    expect(mockShowNotification).not.toHaveBeenCalled();
    expect(result).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should not mark as shown when notification is blocked by cooldown', async () => {
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

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should handle messages without logFunction property', async () => {
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

    const result = await jsMultiLogTypesHandler.process(
      mockEditor,
      context,
      testVersion,
    );

    // Should still detect 2 types and show notification
    expect(mockShowNotification).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
