import * as vscode from 'vscode';
import { listenToActivationDaySeven } from '@/helpers/listenToActivationDaySeven';
import {
  readFromGlobalState,
  writeToGlobalState,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';

jest.mock('vscode');
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
}));
jest.mock('@/notifications/showNotification');

const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockIsJavaScriptOrTypeScriptFile =
  isJavaScriptOrTypeScriptFile as jest.MockedFunction<
    typeof isJavaScriptOrTypeScriptFile
  >;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

describe('listenToActivationDaySeven', () => {
  let mockContext: vscode.ExtensionContext;
  let mockDisposable: vscode.Disposable;
  let onDidChangeActiveTextEditorCallback: (
    editor: vscode.TextEditor | undefined,
  ) => Promise<void>;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
  const TEN_DAYS_MS = 10 * ONE_DAY_MS;
  const TWO_WEEKS_MS = 14 * ONE_DAY_MS;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDisposable = {
      dispose: jest.fn(),
    };

    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      globalState: {} as vscode.Memento,
      workspaceState: {} as vscode.Memento,
    } as unknown as vscode.ExtensionContext;

    // Mock vscode.window.onDidChangeActiveTextEditor
    (vscode.window.onDidChangeActiveTextEditor as jest.Mock) = jest.fn(
      (callback) => {
        onDidChangeActiveTextEditorCallback = callback;
        return mockDisposable;
      },
    );

    // Mock vscode.extensions.getExtension
    (vscode.extensions.getExtension as jest.Mock) = jest.fn(() => ({
      packageJSON: { version: '3.17.0' },
    }));

    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000); // Fixed timestamp
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Early exits (setup-time filters)', () => {
    it('should return early for Pro users without setting up listener', () => {
      mockIsProUser.mockReturnValue(true);

      listenToActivationDaySeven(mockContext, '3.17.0');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if notification already shown without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if user has already used the extension (commandUsageCount > 0)', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 5; // User has used the extension 5 times
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Listener setup', () => {
    it('should set up listener for free users with zero usage who have not seen Day 7 notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0; // Zero usage
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });

    it('should set up listener when COMMAND_USAGE_COUNT is undefined (defaults to 0)', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return undefined; // No usage data (defaults to 0)
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });

  describe('File type filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS; // 10 days since install (within 7-14 window)
        }
        return undefined;
      });
    });

    it('should process JS/TS files', () => {
      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
    });

    it('should skip non-JS/TS files', () => {
      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.md',
        uri: { fsPath: 'test.md' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should handle undefined editor gracefully', () => {
      listenToActivationDaySeven(mockContext, '3.17.0');

      onDidChangeActiveTextEditorCallback(undefined);

      expect(mockIsJavaScriptOrTypeScriptFile).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Activation window checking (7-14 day window)', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should NOT show notification if user installed less than 7 days ago', async () => {
      const FIVE_DAYS_MS = 5 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - FIVE_DAYS_MS; // Only 5 days - too early
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should show notification if user installed exactly 7 days ago', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - SEVEN_DAYS_MS; // Exactly 7 days
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        '3.17.0',
        mockContext,
      );
    });

    it('should show notification if user installed between 7-14 days ago (10 days)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS; // 10 days - within 7-14 window
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        '3.17.0',
        mockContext,
      );
    });

    it('should NOT show notification if user installed 14 days or more ago (handled by two-week return)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TWO_WEEKS_MS; // 14 days - too late for Day 7 event
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).toHaveBeenCalled(); // Listener disposed
    });

    it('should NOT show notification if no install date available (assumes just installed)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return undefined; // No install date
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled(); // 0 days = too early
    });
  });

  describe('Re-checking usage count on each trigger', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should dispose listener if user activated extension between setup and trigger', async () => {
      // Setup: user has zero usage initially
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0; // Zero usage at setup time
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS;
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      // Trigger: user now has usage (used extension between setup and trigger)
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 3; // User activated! (inserted 3 logs between setup and trigger)
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS;
        }
        return false;
      });

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled(); // User already activated
      expect(mockDisposable.dispose).toHaveBeenCalled(); // Listener disposed
    });

    it('should continue if usage count is still zero on trigger', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0; // Still zero
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS;
        }
        return undefined;
      });
      mockShowNotification.mockResolvedValue(true);

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled(); // Proceed with notification
    });
  });

  describe('Notification showing and state update', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS; // 10 days since install
        }
        return undefined;
      });
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should mark notification as shown and dispose listener when notification is displayed', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        '3.17.0',
        mockContext,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
        true,
      );
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should NOT mark as shown or dispose if notification was blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });
  });

  describe('Version parameter', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS;
        }
        return undefined;
      });
      mockShowNotification.mockResolvedValue(true);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should pass version parameter to showNotification', async () => {
      const testVersion = '3.17.0';
      listenToActivationDaySeven(mockContext, testVersion);

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        testVersion,
        mockContext,
      );
    });

    it('should pass different version parameter correctly', async () => {
      const testVersion = '4.0.0';
      listenToActivationDaySeven(mockContext, testVersion);

      const mockDocument = {
        fileName: 'test.js',
        uri: { fsPath: 'test.js' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        testVersion,
        mockContext,
      );
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should handle boundary condition at exactly 14 days', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TWO_WEEKS_MS; // Exactly 14 days (boundary)
        }
        return undefined;
      });

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      // At exactly 14 days, should NOT show (>= TWO_WEEKS_MS condition)
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should handle boundary condition at exactly 7 days', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - SEVEN_DAYS_MS; // Exactly 7 days (boundary)
        }
        return undefined;
      });
      mockShowNotification.mockResolvedValue(true);

      listenToActivationDaySeven(mockContext, '3.17.0');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      // At exactly 7 days, should show (>= SEVEN_DAYS_MS condition)
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        '3.17.0',
        mockContext,
      );
    });
  });
});
