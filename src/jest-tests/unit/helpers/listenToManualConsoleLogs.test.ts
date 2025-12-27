import * as vscode from 'vscode';
import { listenToManualConsoleLogs } from '@/helpers/listenToManualConsoleLogs';
import {
  readFromGlobalState,
  writeToGlobalState,
  getUserActivityStatus,
  isProUser,
  updateUserActivityStatus,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { createMockChangeEvent } from '@/jest-tests/mocks/helpers';

jest.mock('vscode');
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  getUserActivityStatus: jest.fn(),
  isProUser: jest.fn(),
  updateUserActivityStatus: jest.fn(),
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
const mockUpdateUserActivityStatus =
  updateUserActivityStatus as jest.MockedFunction<
    typeof updateUserActivityStatus
  >;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

describe('listenToManualConsoleLogs', () => {
  let mockContext: vscode.ExtensionContext;
  let mockDisposable: vscode.Disposable;
  let onDidChangeTextDocumentCallback: (
    event: vscode.TextDocumentChangeEvent,
  ) => void;

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

    // Mock vscode.workspace.onDidChangeTextDocument
    (vscode.workspace.onDidChangeTextDocument as jest.Mock) = jest.fn(
      (callback) => {
        onDidChangeTextDocumentCallback = callback;
        return mockDisposable;
      },
    );

    // Mock vscode.extensions.getExtension
    (vscode.extensions.getExtension as jest.Mock) = jest.fn(() => ({
      packageJSON: { version: '3.12.4' },
    }));
  });

  describe('Early exits (setup-time filters)', () => {
    it('should return early for Pro users without setting up listener', () => {
      mockIsProUser.mockReturnValue(true);

      listenToManualConsoleLogs(mockContext);

      expect(vscode.workspace.onDidChangeTextDocument).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if notification already shown without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(true); // hasShownNotification

      listenToManualConsoleLogs(mockContext);

      expect(vscode.workspace.onDidChangeTextDocument).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early for ACTIVE users without setting up listener', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false); // hasShownNotification
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);

      listenToManualConsoleLogs(mockContext);

      expect(vscode.workspace.onDidChangeTextDocument).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Listener setup', () => {
    it('should set up listener for INACTIVE users who have not seen notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);

      listenToManualConsoleLogs(mockContext);

      expect(vscode.workspace.onDidChangeTextDocument).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });

  describe('File type filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
    });

    const supportedExtensions = [
      'ts',
      'js',
      'tsx',
      'jsx',
      'mjs',
      'cjs',
      'mts',
      'cts',
      'vue',
      'svelte',
      'astro',
    ];

    supportedExtensions.forEach((ext) => {
      it(`should process .${ext} files`, () => {
        listenToManualConsoleLogs(mockContext);

        const mockEvent = createMockChangeEvent(`test.${ext}`, [
          {
            text: 'c',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ]);

        onDidChangeTextDocumentCallback(mockEvent);

        expect(mockUpdateUserActivityStatus).toHaveBeenCalled();
      });
    });

    const unsupportedExtensions = ['md', 'json', 'txt', 'css', 'html'];

    unsupportedExtensions.forEach((ext) => {
      it(`should skip .${ext} files`, () => {
        listenToManualConsoleLogs(mockContext);

        const mockEvent = createMockChangeEvent(`test.${ext}`, [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ]);

        onDidChangeTextDocumentCallback(mockEvent);

        expect(mockUpdateUserActivityStatus).not.toHaveBeenCalled();
      });
    });
  });

  describe('Status recalculation', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
    });

    it('should recalculate status on each change', () => {
      listenToManualConsoleLogs(mockContext);

      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: 'c',
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockUpdateUserActivityStatus).toHaveBeenCalledWith(mockContext);
      expect(mockGetUserActivityStatus).toHaveBeenCalledWith(mockContext);
    });

    it('should exit if user becomes ACTIVE after recalculation', () => {
      // Setup: User starts INACTIVE
      mockGetUserActivityStatus.mockReturnValueOnce(
        UserActivityStatus.INACTIVE,
      );
      listenToManualConsoleLogs(mockContext);

      // Runtime: User becomes ACTIVE (used Turbo)
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);

      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: 'console.log(',
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Change validation filters', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockShowNotification.mockResolvedValue(true);
      listenToManualConsoleLogs(mockContext);
    });

    it('should skip large replacements (rangeLength > 20)', () => {
      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: 'console.log()',
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 25, // Large replacement
          rangeLength: 25,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should allow small replacements (autocomplete, rangeLength <= 20)', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log()',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 3, // "con" -> "console.log()"
            rangeLength: 3,
            rangeOffset: 0,
          },
        ],
        'console.log()',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      // Should process the change (not skip)
      expect(mockUpdateUserActivityStatus).toHaveBeenCalled();
    });

    it('should skip empty changes', () => {
      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: '',
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should skip large pastes (length > 50)', () => {
      const largeText = 'x'.repeat(51);
      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: largeText,
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should allow text <= 50 characters', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(data)',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log(data)',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockUpdateUserActivityStatus).toHaveBeenCalled();
    });

    it('should skip whitespace-only changes', () => {
      const mockEvent = createMockChangeEvent('test.ts', [
        {
          text: '   \t  ',
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]);

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Empty line tracking and pattern detection', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockShowNotification.mockResolvedValue(true);
      listenToManualConsoleLogs(mockContext);
    });

    it('should detect console.log( when typed on empty line', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG,
        '3.12.4',
        mockContext,
      );
    });

    it('should detect console.log with spaces', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: '  console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        '  console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should not detect console.log without opening parenthesis', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not detect console.log in middle of line (not at start)', () => {
      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'const x = console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'const x = console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should detect when user edits existing line to console.log', () => {
      // First change: Line becomes non-empty with different content
      const mockEvent1 = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'const x = 1',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'const x = 1',
      );

      onDidChangeTextDocumentCallback(mockEvent1);

      // Second change: User edits to console.log( (should trigger - they're manually typing it)
      const mockEvent2 = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 11, // Editing existing line
            rangeLength: 11,
            rangeOffset: 0,
          },
        ],
        'console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent2);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG,
        '3.12.4',
        mockContext,
      );
    });
  });

  describe('Notification and disposal', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      listenToManualConsoleLogs(mockContext);
    });

    it('should persist notification shown flag when wasShown is true', async () => {
      mockShowNotification.mockResolvedValue(true);

      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      await new Promise(process.nextTick);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_INACTIVE_MANUAL_LOG_NOTIFICATION,
        true,
      );
    });

    it('should dispose listener when wasShown is true', async () => {
      mockShowNotification.mockResolvedValue(true);

      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      await new Promise(process.nextTick);

      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should not persist or dispose when wasShown is false (cooldown blocked)', async () => {
      mockShowNotification.mockResolvedValue(false);

      const mockEvent = createMockChangeEvent(
        'test.ts',
        [
          {
            text: 'console.log(',
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 0,
            rangeLength: 0,
            rangeOffset: 0,
          },
        ],
        'console.log(',
      );

      onDidChangeTextDocumentCallback(mockEvent);

      await new Promise(process.nextTick);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });
  });

  describe('Memory management', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      mockUpdateUserActivityStatus.mockReturnValue(UserActivityStatus.INACTIVE);
      listenToManualConsoleLogs(mockContext);
    });

    it('should clean up tracked lines when exceeding 100 entries', () => {
      // Simulate typing on 101 different empty lines
      for (let i = 0; i < 101; i++) {
        const mockEvent = createMockChangeEvent(
          'test.ts',
          [
            {
              text: 'x',
              startLine: i,
              startCharacter: 0,
              endLine: i,
              endCharacter: 0,
              rangeLength: 0,
              rangeOffset: 0,
            },
          ],
          'x',
        );

        onDidChangeTextDocumentCallback(mockEvent);
      }

      // Should not throw or cause memory issues
      expect(mockUpdateUserActivityStatus).toHaveBeenCalledTimes(101);
    });
  });
});
