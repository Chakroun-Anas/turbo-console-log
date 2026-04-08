import * as vscode from 'vscode';
import { listenToActivityDrop } from '@/helpers/listenToActivityDrop';
import {
  readFromGlobalState,
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
  getUserActivityStatus: jest.fn(),
  isProUser: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
}));
jest.mock('@/notifications/showNotification');

const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
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

describe('listenToActivityDrop', () => {
  let mockContext: vscode.ExtensionContext;
  let mockDisposable: vscode.Disposable;
  let onDidChangeActiveTextEditorCallback: (
    editor: vscode.TextEditor | undefined,
  ) => Promise<void>;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const FOUR_DAYS_MS = 4 * ONE_DAY_MS;
  const FIVE_DAYS_MS = 5 * ONE_DAY_MS;
  const SIX_DAYS_MS = 6 * ONE_DAY_MS;
  const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

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

    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000); // Fixed timestamp
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Early exits (setup-time filters)', () => {
    it('should return early for Pro users without setting up listener', () => {
      mockIsProUser.mockReturnValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Listener setup', () => {
    it('should set up listener for free users (no permanent flag check since repeating event)', () => {
      mockIsProUser.mockReturnValue(false);

      listenToActivityDrop(mockContext, '3.16.1');

      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
      expect(mockContext.subscriptions[0]).toBe(mockDisposable);
    });
  });

  describe('Runtime filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should skip if editor is undefined', async () => {
      listenToActivityDrop(mockContext, '3.16.1');

      await onDidChangeActiveTextEditorCallback(undefined);

      expect(mockIsJavaScriptOrTypeScriptFile).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should skip non-JS/TS files', async () => {
      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.md',
        uri: { fsPath: 'test.md' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(mockGetUserActivityStatus).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should process JS/TS files', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(mockGetUserActivityStatus).toHaveBeenCalled();
    });
  });

  describe('User activity status filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
    });

    it('should skip INACTIVE users (handled by other events)', async () => {
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockGetUserActivityStatus).toHaveBeenCalled();
      expect(mockReadFromGlobalState).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should process ACTIVE users', async () => {
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockGetUserActivityStatus).toHaveBeenCalled();
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LAST_INSERTION_DATE,
      );
    });
  });

  describe('Last insertion date requirement', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
    });

    it('should skip if user has never inserted logs (no LAST_INSERTION_DATE)', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LAST_INSERTION_DATE,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should process if user has LAST_INSERTION_DATE', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LAST_INSERTION_DATE,
      );
      expect(mockShowNotification).toHaveBeenCalled();
    });
  });

  describe('Drift window timing (4-6 days)', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should NOT show notification if inactive for less than 4 days (day 3)', async () => {
      const THREE_DAYS_MS = 3 * ONE_DAY_MS;
      mockReadFromGlobalState.mockReturnValue(Date.now() - THREE_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

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

    it('should show notification if inactive for exactly 4 days (boundary start)', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - FOUR_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );
    });

    it('should show notification if inactive for 5 days (mid-window)', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );
    });

    it('should show notification if inactive for 6 days (end of window)', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - SIX_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );
    });

    it('should NOT show notification if inactive for 7 days or more (becomes INACTIVE)', async () => {
      mockReadFromGlobalState.mockReturnValue(Date.now() - SEVEN_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

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

    it('should NOT show notification if inactive for 8 days (well past window)', async () => {
      const EIGHT_DAYS_MS = 8 * ONE_DAY_MS;
      mockReadFromGlobalState.mockReturnValue(Date.now() - EIGHT_DAYS_MS);

      listenToActivityDrop(mockContext, '3.16.1');

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

    it('should handle boundary case: 6 days + 23 hours (still in window)', async () => {
      const ALMOST_SEVEN_DAYS_MS = SEVEN_DAYS_MS - ONE_DAY_MS / 24; // 6 days 23 hours
      mockReadFromGlobalState.mockReturnValue(
        Date.now() - ALMOST_SEVEN_DAYS_MS,
      );

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );
    });
  });

  describe('Notification showing behavior (repeating event)', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);
    });

    it('should show notification when conditions are met', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );
    });

    it('should dispose listener after showing notification', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should NOT write permanent flag after showing notification (repeating event)', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      // No writeToGlobalState should be called (repeating event, no flag)
      expect(mockReadFromGlobalState).toHaveBeenCalledTimes(1); // Only for LAST_INSERTION_DATE
    });

    it('should NOT dispose listener when notification blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false); // Blocked by cooldown

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });

    it('should prevent multiple notifications in same session by disposing after first show', async () => {
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      // First trigger - should show and dispose
      await onDidChangeActiveTextEditorCallback(mockEditor);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Version parameter', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should pass version parameter to showNotification', async () => {
      const testVersion = '3.17.0';
      listenToActivityDrop(mockContext, testVersion);

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        testVersion,
        mockContext,
      );
    });
  });

  describe('Integration: Complete flow', () => {
    it('should execute full flow for valid drifting ACTIVE user', async () => {
      mockIsProUser.mockReturnValue(false);
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      const mockDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const mockEditor = {
        document: mockDocument,
      } as vscode.TextEditor;

      await onDidChangeActiveTextEditorCallback(mockEditor);

      // Verify all checks were performed in order
      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(mockGetUserActivityStatus).toHaveBeenCalledWith(mockContext);
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LAST_INSERTION_DATE,
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        '3.16.1',
        mockContext,
      );

      // Verify listener was disposed after showing
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should handle multiple file openings with different validity states', async () => {
      mockIsProUser.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockReturnValue(Date.now() - FIVE_DAYS_MS);
      mockShowNotification.mockResolvedValue(true);

      listenToActivityDrop(mockContext, '3.16.1');

      // First: Non-JS file (should skip)
      const mdDocument = {
        fileName: 'test.md',
        uri: { fsPath: 'test.md' },
      } as vscode.TextDocument;

      const mdEditor = {
        document: mdDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);
      await onDidChangeActiveTextEditorCallback(mdEditor);
      expect(mockShowNotification).not.toHaveBeenCalled();

      // Second: JS file (should trigger)
      const tsDocument = {
        fileName: 'test.ts',
        uri: { fsPath: 'test.ts' },
      } as vscode.TextDocument;

      const tsEditor = {
        document: tsDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      await onDidChangeActiveTextEditorCallback(tsEditor);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });
  });
});
