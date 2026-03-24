import * as vscode from 'vscode';
import { initialWorkspaceLogsCount } from '@/helpers/initialWorkspaceLogsCount/initialWorkspaceLogsCount';
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
const createMockMessage = (): Message => ({
  spaces: '  ',
  lines: [new vscode.Range(0, 0, 0, 10)],
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
          Array(120)
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
        value: 120,
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

    it('should not show notification if log count is below threshold (100)', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(99)
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

    it('should show notification if log count equals threshold (100)', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
          Array(100)
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
        100,
      );
    });

    it('should show notification if log count exceeds threshold', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
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

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        150,
      );
    });

    it('should mark notification as shown if it was displayed', async () => {
      const mockLogsMap = new Map<string, Message[]>([
        [
          '/test/workspace/file.js',
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
          Array(100)
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
        value: 120,
        tooltip: 'Total log statements in workspace',
      });

      // Verify notification was shown
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_WORKSPACE_LOG_THRESHOLD,
        version,
        context,
        120,
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
});
