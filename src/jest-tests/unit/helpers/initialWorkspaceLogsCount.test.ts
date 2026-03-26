import * as vscode from 'vscode';
import {
  initialWorkspaceLogsCount,
  WorkspaceLogMetadata,
} from '@/helpers/initialWorkspaceLogsCount/initialWorkspaceLogsCount';
import { GitIgnoreMatcher } from '@/helpers/initialWorkspaceLogsCount/GitIgnoreMatcher';
import { collectFilesWithLogs } from '@/helpers/initialWorkspaceLogsCount/collectFilesWithLogs';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey, ExtensionProperties, Message } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock dependencies
jest.mock('@/helpers/initialWorkspaceLogsCount/GitIgnoreMatcher');
jest.mock('@/helpers/initialWorkspaceLogsCount/collectFilesWithLogs');
jest.mock('@/helpers/index');
jest.mock('@/notifications/showNotification');

const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;
const mockCollectFilesWithLogs = collectFilesWithLogs as jest.MockedFunction<
  typeof collectFilesWithLogs
>;

// Helper to create mock Message objects
// VS Code Range has exclusive end, so a log on line N has Range(N, 0, N+1, 0)
const createMockMessage = (lineNumber: number = 0): Message => ({
  spaces: '  ',
  lines: [new vscode.Range(lineNumber, 0, lineNumber + 1, 0)],
  isCommented: false,
  logFunction: 'console.log',
  isTurboConsoleLog: false,
});

describe('initialWorkspaceLogsCount', () => {
  let context: vscode.ExtensionContext;
  let mockLauncherView: jest.Mocked<vscode.TreeView<string>>;
  let mockConfig: ExtensionProperties;
  let mockGitIgnoreMatcher: jest.Mocked<GitIgnoreMatcher>;
  let consoleWarnSpy: jest.SpyInstance;
  let workspaceFolders: vscode.WorkspaceFolder[] | undefined;
  const version = '3.16.0';

  beforeEach(() => {
    jest.clearAllMocks();

    context = makeExtensionContext();

    mockLauncherView = {
      badge: undefined,
    } as unknown as jest.Mocked<vscode.TreeView<string>>;

    mockConfig = {} as ExtensionProperties;

    // Mock GitIgnoreMatcher
    mockGitIgnoreMatcher = {
      init: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<GitIgnoreMatcher>;

    (
      GitIgnoreMatcher as jest.MockedClass<typeof GitIgnoreMatcher>
    ).mockImplementation(() => mockGitIgnoreMatcher);

    // Mock workspaceFolders
    workspaceFolders = undefined;
    Object.defineProperty(vscode.workspace, 'workspaceFolders', {
      get: () => workspaceFolders,
      configurable: true,
    });

    // Default mock implementations
    mockReadFromGlobalState.mockReturnValue(undefined);
    mockShowNotification.mockResolvedValue(true);
    mockCollectFilesWithLogs.mockResolvedValue(new Map());

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Early Returns', () => {
    it('should set badge but not show notification if notification was already shown', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];

      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1200)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockReadFromGlobalState.mockReturnValue(true); // Notification already shown

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Badge should still be set
      expect(mockLauncherView.badge).toEqual({
        value: 1200,
        tooltip: 'Total log statements in workspace',
      });

      // But notification should not be shown again
      expect(mockShowNotification).not.toHaveBeenCalled();
      // Metadata IS written (panel always needs it)
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'WORKSPACE_LOG_METADATA',
        expect.any(Object),
      );
      // But notification flag is NOT written again
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    });

    it('should return early if no workspace folders are opened', async () => {
      workspaceFolders = undefined;

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockLauncherView.badge).toBeUndefined();
      expect(mockGitIgnoreMatcher.init).not.toHaveBeenCalled();
    });

    it('should return early if workspace folders array is empty', async () => {
      workspaceFolders = [];

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockLauncherView.badge).toBeUndefined();
      expect(mockGitIgnoreMatcher.init).not.toHaveBeenCalled();
    });
  });

  describe('GitIgnoreMatcher Error Handling', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should return early if gitIgnoreMatcher.init() fails', async () => {
      mockGitIgnoreMatcher.init.mockRejectedValue(
        new Error('Failed to read .gitignore'),
      );

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[initialWorkspaceLogsCount] Failed to initialize gitignore matcher:',
        expect.any(Error),
      );
      expect(mockLauncherView.badge).toBeUndefined();
      expect(mockCollectFilesWithLogs).not.toHaveBeenCalled();
    });
  });

  describe('File Collection', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should collect logs from all workspace folders', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file1.js',
          [createMockMessage(), createMockMessage()],
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockCollectFilesWithLogs).toHaveBeenCalledWith(
        '/test/workspace',
        mockConfig,
        mockGitIgnoreMatcher,
      );
      expect(mockLauncherView.badge).toEqual({
        value: 2,
        tooltip: 'Total log statements in workspace',
      });
    });

    it('should handle multiple workspace folders', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace1' },
          name: 'test-workspace1',
          index: 0,
        },
        {
          uri: { fsPath: '/test/workspace2' },
          name: 'test-workspace2',
          index: 1,
        },
      ] as vscode.WorkspaceFolder[];

      mockCollectFilesWithLogs
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            ['/test/workspace1/file1.js', [createMockMessage()]],
          ]),
        )
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            ['/test/workspace2/file2.js', [createMockMessage()]],
          ]),
        );

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockCollectFilesWithLogs).toHaveBeenCalledTimes(2);
      expect(mockLauncherView.badge).toEqual({
        value: 2,
        tooltip: 'Total log statements in workspace',
      });
    });

    it('should skip folder if collectFilesWithLogs fails and continue with others', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace1' },
          name: 'test-workspace1',
          index: 0,
        },
        {
          uri: { fsPath: '/test/workspace2' },
          name: 'test-workspace2',
          index: 1,
        },
      ] as vscode.WorkspaceFolder[];

      mockCollectFilesWithLogs
        .mockRejectedValueOnce(new Error('Access denied'))
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            ['/test/workspace2/file.js', [createMockMessage()]],
          ]),
        );

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[initialWorkspaceLogsCount] Failed to collect logs from folder /test/workspace1:',
        expect.any(Error),
      );
      expect(mockLauncherView.badge).toEqual({
        value: 1,
        tooltip: 'Total log statements in workspace',
      });
    });
  });

  describe('Badge Display', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should not show badge if log count is zero', async () => {
      mockCollectFilesWithLogs.mockResolvedValue(new Map());

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockLauncherView.badge).toBeUndefined();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should show badge with correct count for non-zero logs', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file1.js',
          [createMockMessage(), createMockMessage(), createMockMessage()],
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockLauncherView.badge).toEqual({
        value: 3,
        tooltip: 'Total log statements in workspace',
      });
    });

    it('should aggregate logs from multiple files', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file1.js',
          [createMockMessage(), createMockMessage()],
        ],
        [
          '/test/workspace/file2.js',
          [createMockMessage(), createMockMessage(), createMockMessage()],
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockLauncherView.badge).toEqual({
        value: 5,
        tooltip: 'Total log statements in workspace',
      });
    });
  });

  describe('Notification Trigger', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should not show notification if log count is below threshold (1000)', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(999)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockShowNotification).not.toHaveBeenCalled();
      // Note: writeToGlobalState IS called for WORKSPACE_LOG_METADATA (panel needs it)
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'WORKSPACE_LOG_METADATA',
        expect.any(Object),
      );
      // But NOT called for notification flag
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    });

    it('should show notification if log count equals threshold (1000)', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1000)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        1000,
      );
    });

    it('should show notification if log count exceeds threshold', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1500)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        1500,
      );
    });

    it('should mark notification as shown if it was displayed', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1000)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    });

    it('should not mark notification as shown if it was not displayed', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1000)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(false);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Metadata IS written (panel needs it)
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'WORKSPACE_LOG_METADATA',
        expect.any(Object),
      );
      // But notification flag is NOT written (user dismissed notification)
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete success flow with notification', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];

      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(1200)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Verify gitignore was initialized
      expect(mockGitIgnoreMatcher.init).toHaveBeenCalled();

      // Verify files were collected
      expect(mockCollectFilesWithLogs).toHaveBeenCalledWith(
        '/test/workspace',
        mockConfig,
        mockGitIgnoreMatcher,
      );

      // Verify badge was set
      expect(mockLauncherView.badge).toEqual({
        value: 1200,
        tooltip: 'Total log statements in workspace',
      });

      // Verify notification was shown
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        1200,
      );

      // Verify state was updated
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
    });

    it('should handle partial failure scenario gracefully', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace1' },
          name: 'test-workspace1',
          index: 0,
        },
        {
          uri: { fsPath: '/test/workspace2' },
          name: 'test-workspace2',
          index: 1,
        },
      ] as vscode.WorkspaceFolder[];

      mockCollectFilesWithLogs
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            [
              '/test/workspace2/file.js',
              Array(50)
                .fill(null)
                .map(() => createMockMessage()),
            ],
          ]),
        );

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should have warned about first folder
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[initialWorkspaceLogsCount] Failed to collect logs from folder /test/workspace1:',
        expect.any(Error),
      );

      // Should still show badge from second folder
      expect(mockLauncherView.badge).toEqual({
        value: 50,
        tooltip: 'Total log statements in workspace',
      });

      // Should not show notification (below threshold)
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('Log Type Distribution Percentage Calculation', () => {
    it('should ensure percentages always sum to exactly 100%', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];

      // Create a scenario that would cause rounding issues with Math.round()
      // Example: 5, 4, 4, 4 logs (total 17) would give:
      // 29.411%, 23.529%, 23.529%, 23.529% -> rounds to 29%, 24%, 24%, 24% = 101%
      const mockMessages: Message[] = [
        { ...createMockMessage(), logFunction: 'console.log' },
        { ...createMockMessage(), logFunction: 'console.log' },
        { ...createMockMessage(), logFunction: 'console.log' },
        { ...createMockMessage(), logFunction: 'console.log' },
        { ...createMockMessage(), logFunction: 'console.log' },
        { ...createMockMessage(), logFunction: 'console.error' },
        { ...createMockMessage(), logFunction: 'console.error' },
        { ...createMockMessage(), logFunction: 'console.error' },
        { ...createMockMessage(), logFunction: 'console.error' },
        { ...createMockMessage(), logFunction: 'console.warn' },
        { ...createMockMessage(), logFunction: 'console.warn' },
        { ...createMockMessage(), logFunction: 'console.warn' },
        { ...createMockMessage(), logFunction: 'console.warn' },
        { ...createMockMessage(), logFunction: 'console.debug' },
        { ...createMockMessage(), logFunction: 'console.debug' },
        { ...createMockMessage(), logFunction: 'console.debug' },
        { ...createMockMessage(), logFunction: 'console.debug' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Get the written metadata
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      expect(metadataCall).toBeDefined();

      const metadata = metadataCall![2] as {
        logTypeDistribution: Array<{
          type: string;
          count: number;
          percentage: number;
        }>;
      };

      // Sum of all percentages should be exactly 100
      const totalPercentage = metadata.logTypeDistribution.reduce(
        (sum, item) => sum + item.percentage,
        0,
      );
      expect(totalPercentage).toBe(100);

      // Each percentage should be non-negative
      metadata.logTypeDistribution.forEach((item) => {
        expect(item.percentage).toBeGreaterThanOrEqual(0);
        expect(item.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should handle edge case with many log types causing rounding errors', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];

      // Create 7 log types with uneven distribution (total 23 logs)
      // This creates many fractional percentages that could round incorrectly
      const mockMessages: Message[] = [
        { ...createMockMessage(), logFunction: 'console.log' }, // 1
        { ...createMockMessage(), logFunction: 'console.log' }, // 2
        { ...createMockMessage(), logFunction: 'console.log' }, // 3
        { ...createMockMessage(), logFunction: 'console.log' }, // 4 (17.39%)
        { ...createMockMessage(), logFunction: 'console.error' }, // 1
        { ...createMockMessage(), logFunction: 'console.error' }, // 2
        { ...createMockMessage(), logFunction: 'console.error' }, // 3
        { ...createMockMessage(), logFunction: 'console.error' }, // 4 (17.39%)
        { ...createMockMessage(), logFunction: 'console.warn' }, // 1
        { ...createMockMessage(), logFunction: 'console.warn' }, // 2
        { ...createMockMessage(), logFunction: 'console.warn' }, // 3 (13.04%)
        { ...createMockMessage(), logFunction: 'console.debug' }, // 1
        { ...createMockMessage(), logFunction: 'console.debug' }, // 2
        { ...createMockMessage(), logFunction: 'console.debug' }, // 3 (13.04%)
        { ...createMockMessage(), logFunction: 'console.info' }, // 1
        { ...createMockMessage(), logFunction: 'console.info' }, // 2
        { ...createMockMessage(), logFunction: 'console.info' }, // 3 (13.04%)
        { ...createMockMessage(), logFunction: 'console.trace' }, // 1
        { ...createMockMessage(), logFunction: 'console.trace' }, // 2
        { ...createMockMessage(), logFunction: 'console.trace' }, // 3 (13.04%)
        { ...createMockMessage(), logFunction: 'console.dir' }, // 1
        { ...createMockMessage(), logFunction: 'console.dir' }, // 2
        { ...createMockMessage(), logFunction: 'console.dir' }, // 3 (13.04%)
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Get the written metadata
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as {
        logTypeDistribution: Array<{
          type: string;
          count: number;
          percentage: number;
        }>;
      };

      // Sum should still be exactly 100
      const totalPercentage = metadata.logTypeDistribution.reduce(
        (sum, item) => sum + item.percentage,
        0,
      );
      expect(totalPercentage).toBe(100);
    });

    it('should handle single log type (100% case)', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];

      const mockMessages: Message[] = Array(50)
        .fill(null)
        .map(() => ({ ...createMockMessage(), logFunction: 'console.log' }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as {
        logTypeDistribution: Array<{
          type: string;
          count: number;
          percentage: number;
        }>;
      };

      // Single log type should be 100%
      expect(metadata.logTypeDistribution).toHaveLength(1);
      expect(metadata.logTypeDistribution[0].percentage).toBe(100);
    });
  });

  describe('Commented Logs Notification (EXTENSION_WORKSPACE_COMMENTED_LOGS)', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should not show notification if commented log count is below threshold (50)', async () => {
      // Create 49 commented logs (below threshold)
      const mockMessages: Message[] = Array(49)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show commented logs notification
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );

      // Should still write metadata with commented logs info
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      expect(metadataCall).toBeDefined();
      const metadata = metadataCall![2] as WorkspaceLogMetadata;
      expect(metadata.totalCommentedLogs).toBe(49);
      expect(metadata.commentedLogsPercentage).toBe(100);
    });

    it('should show notification if commented log count equals threshold (50)', async () => {
      // Create 50 commented logs (exactly at threshold)
      const mockMessages: Message[] = Array(50)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show commented logs notification
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        version,
        context,
        50,
      );
    });

    it('should show notification if commented log count exceeds threshold', async () => {
      // Create 100 commented logs (above threshold)
      const mockMessages: Message[] = Array(100)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show commented logs notification with correct count
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        version,
        context,
        100,
      );
    });

    it('should not show notification if it was already shown', async () => {
      // Create 75 commented logs (above threshold)
      const mockMessages: Message[] = Array(75)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      // Mock that notification was already shown
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show notification again
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );

      // Should still set badge and write metadata
      expect(mockLauncherView.badge).toEqual({
        value: 75,
        tooltip: 'Total log statements in workspace',
      });
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'WORKSPACE_LOG_METADATA',
        expect.any(Object),
      );
    });

    it('should mark notification as shown if it was displayed', async () => {
      const mockMessages: Message[] = Array(60)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should mark notification as shown
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
        true,
      );
    });

    it('should not mark notification as shown if it was not displayed', async () => {
      const mockMessages: Message[] = Array(60)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(false); // User dismissed

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT mark notification as shown (user dismissed it)
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
        true,
      );

      // But metadata should still be written
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        'WORKSPACE_LOG_METADATA',
        expect.any(Object),
      );
    });

    it('should calculate commentedLogsPercentage correctly (0% commented)', async () => {
      // Create 100 logs, none commented
      const mockMessages: Message[] = Array(100)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: false }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalCommentedLogs).toBe(0);
      expect(metadata.commentedLogsPercentage).toBe(0);
    });

    it('should calculate commentedLogsPercentage correctly (50% commented)', async () => {
      // Create 100 logs, 50 commented
      const mockMessages: Message[] = [
        ...Array(50)
          .fill(null)
          .map(() => ({ ...createMockMessage(), isCommented: true })),
        ...Array(50)
          .fill(null)
          .map(() => ({ ...createMockMessage(), isCommented: false })),
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalCommentedLogs).toBe(50);
      expect(metadata.commentedLogsPercentage).toBe(50);
    });

    it('should calculate commentedLogsPercentage correctly (100% commented)', async () => {
      // Create 100 logs, all commented
      const mockMessages: Message[] = Array(100)
        .fill(null)
        .map(() => ({ ...createMockMessage(), isCommented: true }));

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalCommentedLogs).toBe(100);
      expect(metadata.commentedLogsPercentage).toBe(100);
    });

    it('should handle both notifications independently (1000+ total logs AND 50+ commented logs)', async () => {
      // Create 1200 total logs: 80 commented, 1120 not commented
      const mockMessages: Message[] = [
        ...Array(80)
          .fill(null)
          .map(() => ({ ...createMockMessage(), isCommented: true })),
        ...Array(1120)
          .fill(null)
          .map(() => ({ ...createMockMessage(), isCommented: false })),
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show BOTH notifications (total logs threshold + commented logs threshold)
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        1200,
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        version,
        context,
        80,
      );

      // Should mark BOTH notifications as shown
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
        true,
      );

      // Verify metadata has both counts
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;
      expect(metadata.totalLogs).toBe(1200);
      expect(metadata.totalCommentedLogs).toBe(80);
      expect(metadata.commentedLogsPercentage).toBe(7); // 80/1200 = 6.67% → rounds to 7%
    });

    it('should return 0% for commentedLogsPercentage when totalLogsCount is zero', async () => {
      mockCollectFilesWithLogs.mockResolvedValue(new Map());

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Metadata IS written even when totalLogsCount is 0 (early return happens after metadata write)
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      expect(metadataCall).toBeDefined();
      const metadata = metadataCall![2] as WorkspaceLogMetadata;
      expect(metadata.totalLogs).toBe(0);
      expect(metadata.totalCommentedLogs).toBe(0);
      expect(metadata.commentedLogsPercentage).toBe(0);

      // But badge should NOT be set (early return)
      expect(mockLauncherView.badge).toBeUndefined();
    });

    it('should track commented logs across multiple files', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file1.js',
          [
            { ...createMockMessage(), isCommented: true },
            { ...createMockMessage(), isCommented: true },
            { ...createMockMessage(), isCommented: false },
          ],
        ],
        [
          '/test/workspace/file2.js',
          [
            { ...createMockMessage(), isCommented: true },
            { ...createMockMessage(), isCommented: false },
          ],
        ],
        [
          '/test/workspace/file3.js',
          Array(47)
            .fill(null)
            .map(() => ({ ...createMockMessage(), isCommented: true })),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Total: 52 logs (3+2+47), 50 commented (2+1+47)
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalLogs).toBe(52);
      expect(metadata.totalCommentedLogs).toBe(50);
      expect(metadata.commentedLogsPercentage).toBe(96); // 50/52 = 96.15% → rounds to 96%

      // Should trigger notification (50 commented logs = threshold)
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        version,
        context,
        50,
      );
    });
  });

  describe('Duplicate Logs Detection (EXTENSION_WORKSPACE_DUPLICATE_LOGS)', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should detect consecutive duplicate logs with same content', async () => {
      // Create logs with duplicates - must be on consecutive lines
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("test")' },
        { ...createMockMessage(1), content: 'console.log("test")' }, // Duplicate on consecutive line
        { ...createMockMessage(2), content: 'console.log("different")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalDuplicateLogs).toBe(2); // Both logs in the duplicate pair
      expect(metadata.duplicateGroupsCount).toBe(1); // One group of duplicates
      expect(metadata.duplicateLogsPercentage).toBe(67); // 2/3 = 66.67% → rounds to 67%
    });

    it('should not trigger notification if duplicate groups below threshold (1)', async () => {
      // Create 0 duplicate groups (below threshold of 1) - no consecutive duplicates
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("different")' },
        { ...createMockMessage(2), content: 'console.log("another")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show duplicate logs notification
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );

      // Metadata should show zero duplicates
      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;
      expect(metadata.duplicateGroupsCount).toBe(0);
      expect(metadata.totalDuplicateLogs).toBe(0);
    });

    it('should trigger notification if duplicate groups equal threshold (1)', async () => {
      // Create exactly 1 duplicate group - on consecutive lines
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("a")' }, // Group 1
        { ...createMockMessage(2), content: 'console.log("different")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show duplicate logs notification
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
        version,
        context,
        1, // duplicateGroupsCount
      );
    });

    it('should trigger notification if duplicate groups exceed threshold', async () => {
      // Create 8 duplicate groups (well above threshold) - each on consecutive lines
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("a")' }, // Group 1
        { ...createMockMessage(2), content: 'console.log("b")' },
        { ...createMockMessage(3), content: 'console.log("b")' }, // Group 2
        { ...createMockMessage(4), content: 'console.log("c")' },
        { ...createMockMessage(5), content: 'console.log("c")' }, // Group 3
        { ...createMockMessage(6), content: 'console.log("d")' },
        { ...createMockMessage(7), content: 'console.log("d")' }, // Group 4
        { ...createMockMessage(8), content: 'console.log("e")' },
        { ...createMockMessage(9), content: 'console.log("e")' }, // Group 5
        { ...createMockMessage(10), content: 'console.log("f")' },
        { ...createMockMessage(11), content: 'console.log("f")' }, // Group 6
        { ...createMockMessage(12), content: 'console.log("g")' },
        { ...createMockMessage(13), content: 'console.log("g")' }, // Group 7
        { ...createMockMessage(14), content: 'console.log("h")' },
        { ...createMockMessage(15), content: 'console.log("h")' }, // Group 8
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show duplicate logs notification
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
        version,
        context,
        8, // duplicateGroupsCount
      );
    });

    it('should not show notification if it was already shown', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("a")' }, // Group 1
        { ...createMockMessage(2), content: 'console.log("b")' },
        { ...createMockMessage(3), content: 'console.log("b")' }, // Group 2
        { ...createMockMessage(4), content: 'console.log("c")' },
        { ...createMockMessage(5), content: 'console.log("c")' }, // Group 3
        { ...createMockMessage(6), content: 'console.log("d")' },
        { ...createMockMessage(7), content: 'console.log("d")' }, // Group 4
        { ...createMockMessage(8), content: 'console.log("e")' },
        { ...createMockMessage(9), content: 'console.log("e")' }, // Group 5
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      // Mock that notification was already shown
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_WORKSPACE_DUPLICATE_LOGS_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show notification again
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should mark notification as shown if it was displayed', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("a")' },
        { ...createMockMessage(2), content: 'console.log("b")' },
        { ...createMockMessage(3), content: 'console.log("b")' },
        { ...createMockMessage(4), content: 'console.log("c")' },
        { ...createMockMessage(5), content: 'console.log("c")' },
        { ...createMockMessage(6), content: 'console.log("d")' },
        { ...createMockMessage(7), content: 'console.log("d")' },
        { ...createMockMessage(8), content: 'console.log("e")' },
        { ...createMockMessage(9), content: 'console.log("e")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should mark notification as shown
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_DUPLICATE_LOGS_NOTIFICATION,
        true,
      );
    });

    it('should not mark notification as shown if it was not displayed', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("a")' },
        { ...createMockMessage(1), content: 'console.log("a")' },
        { ...createMockMessage(2), content: 'console.log("b")' },
        { ...createMockMessage(3), content: 'console.log("b")' },
        { ...createMockMessage(4), content: 'console.log("c")' },
        { ...createMockMessage(5), content: 'console.log("c")' },
        { ...createMockMessage(6), content: 'console.log("d")' },
        { ...createMockMessage(7), content: 'console.log("d")' },
        { ...createMockMessage(8), content: 'console.log("e")' },
        { ...createMockMessage(9), content: 'console.log("e")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(false); // User dismissed

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT mark notification as shown (user dismissed it)
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_DUPLICATE_LOGS_NOTIFICATION,
        true,
      );
    });

    it('should handle longer duplicate sequences (3+ consecutive)', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage(0), content: 'console.log("repeated")' },
        { ...createMockMessage(1), content: 'console.log("repeated")' },
        { ...createMockMessage(2), content: 'console.log("repeated")' },
        { ...createMockMessage(3), content: 'console.log("repeated")' }, // 4 consecutive
        { ...createMockMessage(4), content: 'console.log("different")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.duplicateGroupsCount).toBe(1); // One group
      expect(metadata.totalDuplicateLogs).toBe(4); // All 4 logs in the sequence
      expect(metadata.duplicateLogsPercentage).toBe(80); // 4/5 = 80%
    });

    it('should detect duplicates across multiple files independently', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file1.js',
          [
            { ...createMockMessage(0), content: 'console.log("a")' },
            { ...createMockMessage(1), content: 'console.log("a")' }, // Group 1
            { ...createMockMessage(2), content: 'console.log("b")' },
            { ...createMockMessage(3), content: 'console.log("b")' }, // Group 2
          ],
        ],
        [
          '/test/workspace/file2.js',
          [
            { ...createMockMessage(0), content: 'console.log("c")' },
            { ...createMockMessage(1), content: 'console.log("c")' }, // Group 3
            { ...createMockMessage(2), content: 'console.log("d")' },
            { ...createMockMessage(3), content: 'console.log("d")' }, // Group 4
          ],
        ],
        [
          '/test/workspace/file3.js',
          [
            { ...createMockMessage(0), content: 'console.log("e")' },
            { ...createMockMessage(1), content: 'console.log("e")' }, // Group 5
          ],
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.duplicateGroupsCount).toBe(5); // 5 groups total across files
      expect(metadata.totalDuplicateLogs).toBe(10); // 10 duplicate logs total
      expect(metadata.duplicateLogsPercentage).toBe(100); // 10/10 = 100%

      // Should trigger notification (5 groups >= threshold of 1)
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_DUPLICATE_LOGS,
        version,
        context,
        5,
      );
    });

    it('should not count non-consecutive logs as duplicates', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage(), content: 'console.log("a")' },
        { ...createMockMessage(), content: 'console.log("different")' },
        { ...createMockMessage(), content: 'console.log("a")' }, // Same as first but not consecutive
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.duplicateGroupsCount).toBe(0); // No consecutive duplicates
      expect(metadata.totalDuplicateLogs).toBe(0);
      expect(metadata.duplicateLogsPercentage).toBe(0);
    });

    it('should handle logs without content field (backwards compatibility)', async () => {
      const mockMessages: Message[] = [
        { ...createMockMessage() }, // No content field
        { ...createMockMessage() }, // No content field
        { ...createMockMessage(), content: 'console.log("test")' },
      ];

      const mockLogsMap = new Map<string, Message[]>([
        ['/test/workspace/file.js', mockMessages],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      // Should not crash, should handle gracefully
      expect(metadata.duplicateGroupsCount).toBe(0);
      expect(metadata.totalDuplicateLogs).toBe(0);
    });

    it('should calculate 0% for duplicateLogsPercentage when totalLogsCount is zero', async () => {
      mockCollectFilesWithLogs.mockResolvedValue(new Map());

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      const metadataCall = mockWriteToGlobalState.mock.calls.find(
        (call) => call[1] === 'WORKSPACE_LOG_METADATA',
      );
      const metadata = metadataCall![2] as WorkspaceLogMetadata;

      expect(metadata.totalDuplicateLogs).toBe(0);
      expect(metadata.duplicateGroupsCount).toBe(0);
      expect(metadata.duplicateLogsPercentage).toBe(0);
    });
  });

  describe('Hot Folder Detection (EXTENSION_WORKSPACE_HOT_FOLDER)', () => {
    beforeEach(() => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace' },
          name: 'test-workspace',
          index: 0,
        },
      ] as vscode.WorkspaceFolder[];
    });

    it('should not show notification if hot folder log count is below threshold (100)', async () => {
      // Create 99 logs in a nested folder (below threshold)
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/components/Button.tsx',
          Array(33)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/Input.tsx',
          Array(33)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/Card.tsx',
          Array(33)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show hot folder notification (99 logs in src/components)
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should show notification if hot folder log count equals threshold (100)', async () => {
      // Create exactly 100 logs in src/components nested folder
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/components/Button.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/Input.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show hot folder notification with correct count and path
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        100,
        'workspace/src/components',
      );
    });

    it('should show notification if hot folder log count exceeds threshold', async () => {
      // Create 150 logs in src/features/auth nested folder
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/features/auth/Login.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/features/auth/Register.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/features/auth/ResetPassword.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show notification with correct count and path
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        150,
        'workspace/src/features/auth',
      );
    });

    it('should not show notification if it was already shown', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/components/Button.tsx',
          Array(60)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/Input.tsx',
          Array(60)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      // Mock that notification was already shown
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION)
          return true;
        return undefined;
      });

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show notification again
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should mark notification as shown if it was displayed', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/utils/helpers.ts',
          Array(120)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should mark notification as shown
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION,
        true,
      );
    });

    it('should not mark notification as shown if it was not displayed', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/utils/helpers.ts',
          Array(120)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(false); // User dismissed

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT mark notification as shown (user dismissed it)
      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION,
        true,
      );
    });

    it('should find the hottest folder across multiple nested folders', async () => {
      // Create multiple nested folders with different log counts
      const mockLogsMap = new Map<string, Message[]>([
        // src/components: 80 logs (below threshold)
        [
          '/test/workspace/src/components/Button.tsx',
          Array(40)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/Input.tsx',
          Array(40)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        // src/features/auth: 150 logs (hottest!)
        [
          '/test/workspace/src/features/auth/Login.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/features/auth/Register.tsx',
          Array(100)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        // src/utils: 110 logs
        [
          '/test/workspace/src/utils/helpers.ts',
          Array(110)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show notification for the hottest folder (src/features/auth with 150 logs)
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        150,
        'workspace/src/features/auth',
      );
    });

    it('should find hottest folder across multiple workspace folders', async () => {
      workspaceFolders = [
        {
          uri: { fsPath: '/test/workspace1' },
          name: 'frontend',
          index: 0,
        },
        {
          uri: { fsPath: '/test/workspace2' },
          name: 'backend',
          index: 1,
        },
      ] as vscode.WorkspaceFolder[];

      // First workspace: 110 logs in src/components
      mockCollectFilesWithLogs
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            [
              '/test/workspace1/src/components/Button.tsx',
              Array(60)
                .fill(null)
                .map(() => createMockMessage()),
            ],
            [
              '/test/workspace1/src/components/Input.tsx',
              Array(50)
                .fill(null)
                .map(() => createMockMessage()),
            ],
          ]),
        )
        // Second workspace: 180 logs in src/api/controllers (hottest!)
        .mockResolvedValueOnce(
          new Map<string, Message[]>([
            [
              '/test/workspace2/src/api/controllers/UserController.ts',
              Array(90)
                .fill(null)
                .map(() => createMockMessage()),
            ],
            [
              '/test/workspace2/src/api/controllers/AuthController.ts',
              Array(90)
                .fill(null)
                .map(() => createMockMessage()),
            ],
          ]),
        );

      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show notification for the hottest folder across all workspaces
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        180,
        'workspace2/src/api/controllers',
      );
    });

    it('should handle deeply nested folders (3 levels)', async () => {
      // Create logs in a 3-level nested path
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/features/auth/components/LoginForm.tsx',
          Array(60)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/features/auth/components/RegisterForm.tsx',
          Array(50)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should aggregate at 3-level depth: src/features/auth
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        110,
        'workspace/src/features/auth',
      );
    });

    it('should not trigger for shallow folder structure (< 3 levels)', async () => {
      // Create logs in shallow paths (only 2 levels: src/file.ts)
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/src/index.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should NOT show hot folder notification (requires 3+ levels of nesting)
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should handle multiple notifications independently (hot folder + other events)', async () => {
      // Create scenario that triggers multiple events:
      // - 1200 total logs (EXTENSION_WORKSPACE_LOG_THRESHOLD)
      // - 80 commented logs (EXTENSION_WORKSPACE_COMMENTED_LOGS)
      // - 200 logs in hot folder (EXTENSION_WORKSPACE_HOT_FOLDER)
      const mockLogsMap = new Map<string, Message[]>([
        // Hot folder: src/features/auth (200 logs, 80 commented) - this is the hottest!
        [
          '/test/workspace/src/features/auth/Login.tsx',
          Array(80)
            .fill(null)
            .map(() => ({ ...createMockMessage(), isCommented: true })),
        ],
        [
          '/test/workspace/src/features/auth/Register.tsx',
          Array(120)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        // Other files to reach 1200 total (each folder has less than 200 logs)
        [
          '/test/workspace/src/other/file1.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/utils/file2.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/services/file3.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/components/file4.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/lib/file5.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/pages/file6.ts',
          Array(150)
            .fill(null)
            .map(() => createMockMessage()),
        ],
        [
          '/test/workspace/src/hooks/file7.ts',
          Array(100)
            .fill(null)
            .map(() => createMockMessage()),
        ],
      ]);

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should show all three notifications
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        1200,
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_COMMENTED_LOGS,
        version,
        context,
        80,
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        200,
        'workspace/src/features/auth',
      );

      // Should mark all three as shown
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_LOG_THRESHOLD_NOTIFICATION,
        true,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_COMMENTED_LOGS_NOTIFICATION,
        true,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_WORKSPACE_HOT_FOLDER_NOTIFICATION,
        true,
      );
    });

    it('should handle edge case with exactly 100 logs split across many files in one folder', async () => {
      // 20 files with 5 logs each = 100 logs in src/components
      const mockLogsMap = new Map<string, Message[]>();
      for (let i = 0; i < 20; i++) {
        mockLogsMap.set(
          `/test/workspace/src/components/Component${i}.tsx`,
          Array(5)
            .fill(null)
            .map(() => createMockMessage()),
        );
      }

      mockCollectFilesWithLogs.mockResolvedValue(mockLogsMap);
      mockShowNotification.mockResolvedValue(true);

      await initialWorkspaceLogsCount(
        mockConfig,
        mockLauncherView,
        context,
        version,
      );

      // Should detect hot folder even when logs are spread across many files
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_HOT_FOLDER,
        version,
        context,
        100,
        'workspace/src/components',
      );
    });
  });
});
