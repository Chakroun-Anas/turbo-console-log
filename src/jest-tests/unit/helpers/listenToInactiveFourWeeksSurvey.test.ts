import * as vscode from 'vscode';
import { listenToInactiveFourWeeksSurvey } from '@/helpers/listenToInactiveFourWeeksSurvey';
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

describe('listenToInactiveFourWeeksSurvey', () => {
  let mockContext: vscode.ExtensionContext;
  let mockDisposable: vscode.Disposable;
  let onDidChangeActiveTextEditorCallback: (
    editor: vscode.TextEditor | undefined,
  ) => Promise<void>;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TWO_WEEKS_MS = 14 * ONE_DAY_MS;
  const FOUR_WEEKS_MS = 28 * ONE_DAY_MS;
  const SIX_WEEKS_MS = 42 * ONE_DAY_MS;

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

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if notification already shown without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_FOUR_WEEKS_SURVEY_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early for ACTIVE users without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Listener setup', () => {
    it('should set up listener for INACTIVE users who have not seen notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - THIRTY_DAYS_MS; // 30 days inactive (28+ days)
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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

    it('should NOT show notification if user inactive for less than 28 days (14 days)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWO_WEEKS_MS; // 14 days - not enough
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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

    it('should NOT show notification if user inactive for less than 28 days (20 days)', async () => {
      const TWENTY_DAYS_MS = 20 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - TWENTY_DAYS_MS; // 20 days - not enough
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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

    it('should show notification if user inactive for exactly 28 days', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - FOUR_WEEKS_MS; // Exactly 28 days
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
        '3.16.1',
        mockContext,
      );
    });

    it('should show notification if user inactive for more than 28 days (30 days)', async () => {
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - THIRTY_DAYS_MS; // 30 days - qualifies
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
        '3.16.1',
        mockContext,
      );
    });

    it('should show notification if user inactive for 42 days (6 weeks)', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - SIX_WEEKS_MS; // 42 days - qualifies
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
        '3.16.1',
        mockContext,
      );
    });

    it('should use ACTIVITY_CHECK_START_DATE if LAST_INSERTION_DATE is not available', async () => {
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return undefined; // No insertion date
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - THIRTY_DAYS_MS; // 30 days since extension installed
        }
        return false;
      });

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
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

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
  });

  describe('Notification showing and state update', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - THIRTY_DAYS_MS; // 30 days inactive (28+ days)
        }
        return false;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
    });

    it('should mark notification as shown and dispose listener when notification is displayed', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

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
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
        '3.16.1',
        mockContext,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_INACTIVE_FOUR_WEEKS_SURVEY_NOTIFICATION,
        true,
      );
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should NOT mark as shown or dispose if notification was blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });
  });

  describe('Version parameter', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          return Date.now() - THIRTY_DAYS_MS; // 30 days inactive (28+ days)
        }
        return false;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockShowNotification.mockResolvedValue(true);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should pass version parameter to showNotification', async () => {
      const testVersion = '3.16.1';
      listenToInactiveFourWeeksSurvey(mockContext, testVersion);

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_FOUR_WEEKS_SURVEY,
        testVersion,
        mockContext,
      );
    });
  });

  describe('No mutual exclusion with other events', () => {
    it('should set up listener even when manual log notification was shown', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_FOUR_WEEKS_SURVEY_NOTIFICATION
        ) {
          return false; // This notification not shown
        }
        if (key === GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION) {
          return true; // Manual log notification WAS shown
        }
        return undefined;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      // Listener SHOULD still be set up (no mutual exclusion)
      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });

    it('should set up listener even when two weeks return notification was shown', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_FOUR_WEEKS_SURVEY_NOTIFICATION
        ) {
          return false; // This notification not shown
        }
        if (
          key ===
          GlobalStateKey.HAS_SHOWN_INACTIVE_TWO_WEEKS_RETURN_NOTIFICATION
        ) {
          return true; // Two weeks notification WAS shown
        }
        return undefined;
      });
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToInactiveFourWeeksSurvey(mockContext, '3.16.1');

      // Listener SHOULD still be set up (no mutual exclusion)
      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });
});
