import * as vscode from 'vscode';
import { detectPhpWorkspace } from '@/helpers/detectPhpWorkspace';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

// Mock VS Code workspace API
jest.mock('vscode', () => ({
  workspace: {
    findFiles: jest.fn(),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
  },
}));

describe('detectPhpWorkspace', () => {
  // Use fake timers to handle setTimeout in the code
  jest.useFakeTimers();
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;
  const mockFindFiles = vscode.workspace.findFiles as jest.MockedFunction<
    typeof vscode.workspace.findFiles
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
    mockFindFiles.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('when notification has already been shown', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockReturnValue(true);
    });

    it('should not detect PHP files or show notification', async () => {
      await detectPhpWorkspace(mockContext, '3.9.6');

      expect(mockFindFiles).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('when notification has not been shown yet', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockReturnValue(false);
    });

    describe('PHP workspace detection', () => {
      it('should detect PHP workspace when any PHP indicator is found', async () => {
        // Mock finding a PHP file (could be any of the indicators)
        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/composer.json' },
        ] as vscode.Uri[]);

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(mockFindFiles).toHaveBeenCalledWith(
          '{**/composer.json,**/*.php,**/artisan,**/wp-config.php}',
          '**/node_modules/**',
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
          true,
        );
        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          '3.9.6',
          mockContext,
        );
      });

      it('should detect PHP workspace with different file types', async () => {
        // Test with .php file
        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/index.php' },
        ] as vscode.Uri[]);

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          '3.9.6',
          mockContext,
        );
      });

      it('should detect Laravel projects (artisan)', async () => {
        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/artisan' },
        ] as vscode.Uri[]);

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          '3.9.6',
          mockContext,
        );
      });

      it('should detect WordPress projects (wp-config.php)', async () => {
        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/wp-config.php' },
        ] as vscode.Uri[]);

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          '3.9.6',
          mockContext,
        );
      });

      it('should not show notification when no PHP indicators are found', async () => {
        mockFindFiles.mockResolvedValue([]);

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(mockShowNotification).not.toHaveBeenCalled();
        expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      });

      it('should work without version parameter', async () => {
        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/composer.json' },
        ] as vscode.Uri[]);

        await detectPhpWorkspace(mockContext);

        expect(mockShowNotification).toHaveBeenCalledWith(
          NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED,
          undefined,
          mockContext,
        );
      });
    });

    describe('edge cases', () => {
      it('should handle errors gracefully without crashing', async () => {
        // Suppress console.warn for this test
        const consoleWarnSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        mockFindFiles.mockRejectedValue(new Error('File system error'));

        await expect(
          detectPhpWorkspace(mockContext, '3.9.6'),
        ).resolves.not.toThrow();

        expect(mockShowNotification).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
      });

      it('should mark notification as shown before showing to avoid duplicates', async () => {
        const callOrder: string[] = [];

        mockFindFiles.mockResolvedValue([
          { fsPath: '/test/workspace/composer.json' },
        ] as vscode.Uri[]);

        mockWriteToGlobalState.mockImplementation(() => {
          callOrder.push('write-state');
        });

        mockShowNotification.mockImplementation(async () => {
          callOrder.push('show-notification');
        });

        await detectPhpWorkspace(mockContext, '3.9.6');

        expect(callOrder).toEqual(['write-state', 'show-notification']);
      });
    });
  });

  describe('when no workspace is open', () => {
    beforeEach(() => {
      // Mock no workspace folders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (vscode.workspace as any).workspaceFolders = undefined;
      mockReadFromGlobalState.mockReturnValue(false);
    });

    afterEach(() => {
      // Restore workspace folders for other tests
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (vscode.workspace as any).workspaceFolders = [
        { uri: { fsPath: '/test/workspace' } },
      ];
    });

    it('should not detect PHP files or show notification', async () => {
      await detectPhpWorkspace(mockContext, '3.9.6');

      expect(mockFindFiles).not.toHaveBeenCalled();
      expect(mockShowNotification).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('integration with GlobalStateKey', () => {
    it('should use correct GlobalStateKey constant', async () => {
      mockReadFromGlobalState.mockReturnValue(false);
      mockFindFiles.mockResolvedValue([
        { fsPath: '/test/workspace/composer.json' },
      ] as vscode.Uri[]);

      await detectPhpWorkspace(mockContext, '3.9.6');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
      );

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
        true,
      );
    });
  });
});
