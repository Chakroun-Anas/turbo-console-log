import * as vscode from 'vscode';
import { listenToInactiveTwoWeeksReturn } from '@/helpers/listenToInactiveTwoWeeksReturn';
import {
  readFromGlobalState,
  writeToGlobalState,
  getUserActivityStatus,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';

jest.mock('vscode');
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  getUserActivityStatus: jest.fn(),
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
const mockGetUserActivityStatus = getUserActivityStatus as jest.MockedFunction<
  typeof getUserActivityStatus
>;
const mockIsJavaScriptOrTypeScriptFile =
  isJavaScriptOrTypeScriptFile as jest.MockedFunction<
    typeof isJavaScriptOrTypeScriptFile
  >;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

describe('listenToInactiveTwoWeeksReturn', () => {
  let mockContext: vscode.ExtensionContext;
  let mockDisposable: vscode.Disposable;
  let onDidChangeActiveTextEditorCallback: (
    editor: vscode.TextEditor | undefined,
  ) => Promise<void>;

  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

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
      packageJSON: { version: '3.16.1' },
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

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if notification already shown without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if user already received manual log notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION) {
          return true;
        }
        return undefined;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early for ACTIVE users without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Listener setup', () => {
    it('should set up listener for INACTIVE users who have not seen notification and have not seen manual log notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });

  describe('File type filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
    });

    it('should process JS/TS files', () => {
      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

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
      const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days inactive (within 14-28 window)
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

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
      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      onDidChangeActiveTextEditorCallback(undefined);

      expect(mockIsJavaScriptOrTypeScriptFile).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Inactivity duration checking', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should NOT show notification if user inactive for less than 14 days', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - ONE_WEEK_MS; // 7 days - not enough
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should show notification if user inactive for exactly 14 days', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWO_WEEKS_MS; // Exactly 14 days
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        '3.16.1',
        mockContext,
      );
    });

    it('should show notification if user inactive for more than 14 days but less than 28 days (20 days)', async () => {
      const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days - within 14-28 window
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        '3.16.1',
        mockContext,
      );
    });

    it('should NOT show notification if user inactive for 28 days or more (handled by separate event)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - FOUR_WEEKS_MS; // 28 days - too inactive
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should use ACTIVITY_CHECK_START_DATE if LAST_INSERTION_DATE is not available', async () => {
      const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return undefined; // No insertion date
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days since extension installed
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        '3.16.1',
        mockContext,
      );
    });

    it('should NOT show notification if neither date is available (just installed)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return undefined;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return undefined;
        }
        return false;
      });

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Notification showing and state update', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days inactive (within 14-28 window)
        }
        return false;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
    });

    it('should mark notification as shown and dispose listener when notification is displayed', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        '3.16.1',
        mockContext,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION,
        true,
      );
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should NOT mark as shown or dispose if notification was blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });
  });

  describe('Version parameter', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days inactive (within 14-28 window)
        }
        return false;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockShowNotification.mockResolvedValue(true);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should pass version parameter to showNotification', async () => {
      const testVersion = '3.16.1';
      listenToInactiveTwoWeeksReturn(mockContext, testVersion);

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN,
        testVersion,
        mockContext,
      );
    });
  });

  describe('Mutual exclusion with manual log notification', () => {
    it('should respect mutual exclusion - early exit when manual log notification was shown', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION
        ) {
          return false; // This notification not shown
        }
        if (key === GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION) {
          return true; // Manual log notification WAS shown
        }
        return undefined;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      // Listener should NOT be set up
      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should allow setup when manual log notification was NOT shown', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION) {
          return false; // Manual log notification NOT shown
        }
        return undefined;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveTwoWeeksReturn(mockContext, '3.16.1');

      // Listener SHOULD be set up
      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });
});
