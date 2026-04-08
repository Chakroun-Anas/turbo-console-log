import * as vscode from 'vscode';
import { listenToLogLibraryInstalled } from '@/helpers/listenToLogLibraryInstalled';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';

jest.mock('vscode');
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
}));
jest.mock('@/notifications/showNotification');

const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

describe('listenToLogLibraryInstalled', () => {
  let mockContext: vscode.ExtensionContext;
  let mockWatcher: vscode.FileSystemWatcher;
  let mockOnCreateDisposable: vscode.Disposable;
  let mockOnChangeDisposable: vscode.Disposable;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _onDidCreateCallback: (uri: vscode.Uri) => Promise<void>;
  let onDidChangeCallback: (uri: vscode.Uri) => Promise<void>;
  let mockLockFileUri: vscode.Uri;
  let mockPackageJsonContent: string;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Spy on console methods to silence output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Mock lock file URI (e.g., package-lock.json)
    mockLockFileUri = {
      fsPath: '/path/to/project/package-lock.json',
      scheme: 'file',
    } as vscode.Uri;

    mockOnCreateDisposable = {
      dispose: jest.fn(),
    };

    mockOnChangeDisposable = {
      dispose: jest.fn(),
    };

    mockWatcher = {
      onDidCreate: jest.fn((callback) => {
        _onDidCreateCallback = callback;
        return mockOnCreateDisposable;
      }),
      onDidChange: jest.fn((callback) => {
        onDidChangeCallback = callback;
        return mockOnChangeDisposable;
      }),
      dispose: jest.fn(),
    } as unknown as vscode.FileSystemWatcher;

    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      globalState: {} as vscode.Memento,
      workspaceState: {} as vscode.Memento,
    } as unknown as vscode.ExtensionContext;

    // Mock vscode.workspace.createFileSystemWatcher
    (vscode.workspace.createFileSystemWatcher as jest.Mock) = jest.fn(
      () => mockWatcher,
    );

    // Mock vscode.workspace.fs.readFile to return package.json content
    if (!vscode.workspace.fs) {
      (vscode.workspace as unknown as { fs: typeof vscode.workspace.fs }).fs =
        {} as typeof vscode.workspace.fs;
    }
    (vscode.workspace.fs.readFile as jest.Mock) = jest.fn(
      async (uri: vscode.Uri) => {
        // Verify it's reading package.json (not the lock file)
        if (uri.fsPath.endsWith('package.json')) {
          return Buffer.from(mockPackageJsonContent || '{}');
        }
        throw new Error('Unexpected file read: ' + uri.fsPath);
      },
    );

    // Mock vscode.Uri.file
    (vscode.Uri.file as jest.Mock) = jest.fn((path: string) => ({
      fsPath: path,
      scheme: 'file',
    }));

    // Mock vscode.Uri.joinPath for baseline initialization
    (vscode.Uri.joinPath as jest.Mock) = jest.fn(
      (baseUri: vscode.Uri, ...pathSegments: string[]) => ({
        fsPath: `${baseUri.fsPath}/${pathSegments.join('/')}`,
        scheme: 'file',
      }),
    );

    // Mock workspace folders for baseline initialization
    (
      vscode.workspace as unknown as {
        workspaceFolders: readonly vscode.WorkspaceFolder[];
      }
    ).workspaceFolders = [
      {
        uri: {
          fsPath: '/path/to/project',
          scheme: 'file',
        },
        name: 'test-project',
        index: 0,
      } as vscode.WorkspaceFolder,
    ];
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Early exits (setup-time filters)', () => {
    it('should return early for Pro users without setting up watcher', () => {
      mockIsProUser.mockReturnValue(true);

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      expect(vscode.workspace.createFileSystemWatcher).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });

    it('should return early if notification has already been shown (permanent flag)', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(true);

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
      );
      expect(vscode.workspace.createFileSystemWatcher).not.toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(0);
    });
  });

  describe('Watcher setup', () => {
    it('should set up file system watcher for lock files for free users who have not seen notification', () => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledWith(
        '**/{package-lock.json,pnpm-lock.yaml,yarn.lock}',
        false, // don't ignore creates
        false, // watch changes
        true, // ignore deletes
      );
      expect(mockWatcher.onDidCreate).toHaveBeenCalled();
      expect(mockWatcher.onDidChange).toHaveBeenCalled();
      expect(mockContext.subscriptions).toHaveLength(3); // watcher + onCreate + onChange disposables
      expect(mockContext.subscriptions[0]).toBe(mockWatcher);
      expect(mockContext.subscriptions[1]).toBe(mockOnCreateDisposable);
      expect(mockContext.subscriptions[2]).toBe(mockOnChangeDisposable);
    });
  });

  describe('Runtime filtering', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
    });

    it('should process lock file changes and read corresponding package.json', async () => {
      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
        },
      });

      mockShowNotification.mockResolvedValue(true);

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now add winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      expect(vscode.Uri.file).toHaveBeenCalledWith(
        '/path/to/project/package.json',
      );
      expect(vscode.workspace.fs.readFile).toHaveBeenCalled();
      expect(mockShowNotification).toHaveBeenCalled();
    });
  });

  describe('JSON parsing error handling', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
    });

    it('should handle invalid JSON gracefully without crashing', async () => {
      mockPackageJsonContent = '{invalid json content';

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      await onDidChangeCallback(mockLockFileUri);

      expect(vscode.workspace.fs.readFile).toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('False positive prevention', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should NOT show notification when existing logging library remains and non-logging library is added', async () => {
      // Setup: Project already has winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
        },
      });

      // Initialize listener (establishes baseline with winston)
      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate: User installs express (non-logging library)
      // package.json now has winston + express
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
          express: '^4.18.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      // Should NOT show notification (winston was already present, express is not a logging library)
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockWatcher.dispose).not.toHaveBeenCalled();
    });

    it('should show notification when NEW logging library is added to project with existing logging library', async () => {
      // Setup: Project already has winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
        },
      });

      // Initialize listener (establishes baseline with winston)
      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate: User installs pino (NEW logging library)
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
          pino: '^8.0.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      // SHOULD show notification (pino is NEW)
      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).toHaveBeenCalled();
      expect(mockWatcher.dispose).toHaveBeenCalled();
    });

    it('should show notification when FIRST logging library is added to project', async () => {
      // Setup: Project has no logging libraries
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
        },
      });

      // Initialize listener (establishes baseline with no logging libraries)
      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate: User installs winston (FIRST logging library)
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      // SHOULD show notification (winston is NEW/FIRST)
      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).toHaveBeenCalled();
      expect(mockWatcher.dispose).toHaveBeenCalled();
    });
  });

  describe('Logging library detection', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);
    });

    describe('Positive cases - should detect logging libraries', () => {
      it('should detect winston in dependencies', async () => {
        // Start with no logging libraries in baseline
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add winston
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            winston: '^3.8.0',
            express: '^4.18.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_LOG_LIBRARY_INSTALLED,
          '3.16.1',
          mockContext,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
          true,
        );
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect pino in dependencies', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add pino
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
            pino: '^8.0.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect bunyan in devDependencies', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add bunyan
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
          devDependencies: {
            bunyan: '^1.8.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect log4js in peerDependencies', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add log4js
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
          peerDependencies: {
            log4js: '^6.0.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect signale in optionalDependencies', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add signale
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
          optionalDependencies: {
            signale: '^1.4.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect multiple logging libraries', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add multiple logging libraries
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
            winston: '^3.8.0',
            pino: '^8.0.0',
          },
          devDependencies: {
            debug: '^4.3.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect loglevel', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({});

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add loglevel
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            loglevel: '^1.8.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect consola', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({});

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add consola
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            consola: '^3.0.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect roarr', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({});

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add roarr
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            roarr: '^7.0.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });

      it('should detect npmlog', async () => {
        // Start with no logging libraries
        mockPackageJsonContent = JSON.stringify({});

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        // Wait for baseline initialization
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Now add npmlog
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            npmlog: '^7.0.0',
          },
        });

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).toHaveBeenCalled();
        expect(mockWriteToGlobalState).toHaveBeenCalled();
        expect(mockWatcher.dispose).toHaveBeenCalled();
      });
    });

    describe('Negative cases - should NOT detect non-logging libraries', () => {
      it('should NOT show notification for non-logging libraries (express, react)', async () => {
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            express: '^4.18.0',
            react: '^18.2.0',
            lodash: '^4.17.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
        expect(mockWatcher.dispose).not.toHaveBeenCalled();
      });

      it('should NOT detect partial matches (winston-daily-rotate-file without winston)', async () => {
        mockPackageJsonContent = JSON.stringify({
          dependencies: {
            'winston-daily-rotate-file': '^4.7.0',
          },
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
        expect(mockWatcher.dispose).not.toHaveBeenCalled();
      });

      it('should NOT show notification if package.json has no dependencies sections', async () => {
        mockPackageJsonContent = JSON.stringify({
          name: 'my-project',
          version: '1.0.0',
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
        expect(mockWatcher.dispose).not.toHaveBeenCalled();
      });

      it('should NOT show notification for empty dependencies', async () => {
        mockPackageJsonContent = JSON.stringify({
          dependencies: {},
          devDependencies: {},
        });

        listenToLogLibraryInstalled(mockContext, '3.16.1');

        await onDidChangeCallback(mockLockFileUri);

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
        expect(mockWatcher.dispose).not.toHaveBeenCalled();
      });
    });
  });

  describe('One-time event behavior', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should set permanent flag after showing notification', async () => {
      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({});

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now add winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
        true,
      );
    });

    it('should dispose watcher after showing notification (one-time event)', async () => {
      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({});

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now add pino
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          pino: '^8.0.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      expect(mockWatcher.dispose).toHaveBeenCalled();
    });

    it('should NOT dispose watcher if no logging library detected', async () => {
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
        },
      });

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      await onDidChangeCallback(mockLockFileUri);

      expect(mockWatcher.dispose).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('Integration flow', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);
      mockShowNotification.mockResolvedValue(true);
    });

    it('should complete full flow: detect library → show notification → set flag → dispose watcher', async () => {
      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({});

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now add winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      // Check notification was shown
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_LOG_LIBRARY_INSTALLED,
        '3.16.1',
        mockContext,
      );

      // Check permanent flag was set
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_LOG_LIBRARY_INSTALLED_NOTIFICATION,
        true,
      );

      // Check watcher was disposed
      expect(mockWatcher.dispose).toHaveBeenCalled();

      // Verify proper sequencing: notification shows before flag is set
      const notificationCallIndex =
        mockShowNotification.mock.invocationCallOrder[0];
      const writeStateCallIndex =
        mockWriteToGlobalState.mock.invocationCallOrder[0];
      expect(notificationCallIndex).toBeLessThan(writeStateCallIndex);
    });

    it('should NOT set flag or dispose if notification fails to show (cooldown/pause)', async () => {
      mockShowNotification.mockResolvedValue(false); // Notification failed (cooldown)

      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({});

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Now add winston
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      // Notification was attempted but failed (cooldown), so no flag or disposal
      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockWatcher.dispose).not.toHaveBeenCalled();
    });

    it('should handle multiple package.json changes before library installation (watcher persists)', async () => {
      // Start with no logging libraries
      mockPackageJsonContent = JSON.stringify({});

      listenToLogLibraryInstalled(mockContext, '3.16.1');

      // Wait for baseline initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      // First change: no logging library
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWatcher.dispose).not.toHaveBeenCalled();

      // Second change: logging library installed
      mockPackageJsonContent = JSON.stringify({
        dependencies: {
          express: '^4.18.0',
          winston: '^3.8.0',
        },
      });

      await onDidChangeCallback(mockLockFileUri);

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
      expect(mockWatcher.dispose).toHaveBeenCalledTimes(1);
    });
  });
});
