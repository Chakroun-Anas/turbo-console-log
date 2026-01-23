import * as vscode from 'vscode';
import { listenToCommitWithLogs } from '@/helpers/listenToCommitWithLogs';
import {
  readFromGlobalState,
  writeToGlobalState,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
  getExtensionProperties,
  isProUser,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { ExtensionProperties, GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
  isPhpFile: jest.fn(),
  getExtensionProperties: jest.fn(),
  isProUser: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('vscode', () => ({
  workspace: {
    getConfiguration: jest.fn(),
    openTextDocument: jest.fn(),
  },
  extensions: {
    getExtension: jest.fn(),
  },
}));

describe('listenToCommitWithLogs', () => {
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
  const mockIsPhpFile = isPhpFile as jest.MockedFunction<typeof isPhpFile>;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockGetExtensionProperties =
    getExtensionProperties as jest.MockedFunction<
      typeof getExtensionProperties
    >;

  const testVersion = '3.16.0';

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
    mockGetExtensionProperties.mockReturnValue({
      logFunction: 'console.log',
      logMessagePrefix: '🚀',
      delimiterInsideMessage: '~',
    } as ExtensionProperties);

    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({});
  });

  describe('Early exits', () => {
    it('should not set up listener for Pro users', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(true);

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue(undefined);

      listenToCommitWithLogs(context, testVersion);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockGetExtension).not.toHaveBeenCalled();
    });

    it('should not set up listener when notification already shown', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(true);

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue(undefined);

      listenToCommitWithLogs(context, testVersion);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_COMMIT_WITH_LOGS_NOTIFICATION,
      );
      expect(mockGetExtension).not.toHaveBeenCalled();
    });

    it('should not set up listener when Git extension is not available', () => {
      const context = makeExtensionContext();
      mockIsProUser.mockReturnValue(false);
      mockReadFromGlobalState.mockReturnValue(false);

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue(undefined);

      listenToCommitWithLogs(context, testVersion);

      expect(mockGetExtension).toHaveBeenCalledWith('vscode.git');
    });
  });

  describe('Repository monitoring setup', () => {
    it('should monitor existing repositories when Git extension is available', () => {
      const context = makeExtensionContext();
      const mockOnDidChange = jest.fn();
      const mockOnDidOpenRepository = jest.fn(() => ({
        dispose: jest.fn(),
      }));

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: jest.fn(),
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: mockOnDidOpenRepository,
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      expect(mockGitExtension.getAPI).toHaveBeenCalledWith(1);
      expect(mockOnDidChange).toHaveBeenCalled();
      expect(mockOnDidOpenRepository).toHaveBeenCalled();
    });

    it('should add disposables to context subscriptions', () => {
      const context = makeExtensionContext();
      const pushSpy = jest.spyOn(context.subscriptions, 'push');

      const mockOnDidChange = jest.fn(() => ({ dispose: jest.fn() }));
      const mockOnDidOpenRepository = jest.fn(() => ({
        dispose: jest.fn(),
      }));

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: jest.fn(),
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: mockOnDidOpenRepository,
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Should add: state change disposable + onDidOpenRepository disposable
      expect(pushSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Staged files analysis', () => {
    it('should check staged files when working tree is clean and files are staged', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(`
diff --git a/file.ts b/file.ts
index 123..456 789
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
 function test() {
+  console.log('debug');
   return true;
 }
`);

      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [], // Clean
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Trigger state change
      await stateChangeCallback!();

      expect(mockDiffIndexWithHEAD).toHaveBeenCalledWith('/test/file.ts');
      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
    });

    it('should not check files when working tree is dirty', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockDiffIndexWithHEAD = jest.fn();

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [
            { uri: { fsPath: '/test/file.ts' } as vscode.Uri, status: 0 },
          ],
          workingTreeChanges: [
            { uri: { fsPath: '/test/other.ts' } as vscode.Uri, status: 1 },
          ], // Dirty
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      await stateChangeCallback!();

      // Should NOT check because working tree is dirty
      expect(mockDiffIndexWithHEAD).not.toHaveBeenCalled();
    });
  });

  describe('Log detection in diffs', () => {
    it('should detect console.log in JS/TS files', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithLog = `
+  console.log('test');
`;

      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithLog);
      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      await stateChangeCallback!();

      // File should be tracked as containing logs
      expect(mockDiffIndexWithHEAD).toHaveBeenCalled();
    });

    it('should detect PHP log functions', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.php' } as vscode.Uri;
      const mockDocument = { languageId: 'php' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);
      mockIsPhpFile.mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithLog = `
+  var_dump($data);
`;

      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithLog);
      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      await stateChangeCallback!();

      expect(mockIsPhpFile).toHaveBeenCalledWith(mockDocument);
    });

    it('should not detect logs in non-added lines', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      // Log is in context line (not added)
      const diffWithoutAddedLog = `
 console.log('existing');
+  return true;
`;

      const mockDiffIndexWithHEAD = jest
        .fn()
        .mockResolvedValue(diffWithoutAddedLog);
      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      await stateChangeCallback!();

      // Should not track file since log wasn't in added line
      expect(mockDiffIndexWithHEAD).toHaveBeenCalled();
    });
  });

  describe('Commit detection and notification', () => {
    it('should detect commit and show notification when logs were committed', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockShowNotification.mockResolvedValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithLog = `+  console.log('test');`;
      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithLog);

      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Stage files with logs
      await stateChangeCallback!();

      // Simulate commit (index becomes empty)
      mockRepository.state.indexChanges = [];
      await stateChangeCallback!();

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_COMMIT_WITH_LOGS,
        testVersion,
        context,
      );
    });

    it('should mark notification as shown and dispose listener after successful notification', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockShowNotification.mockResolvedValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithLog = `+  console.log('test');`;
      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithLog);

      const mockDisposable = { dispose: jest.fn() };
      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return mockDisposable;
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Stage and commit
      await stateChangeCallback!();
      mockRepository.state.indexChanges = [];
      await stateChangeCallback!();

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_COMMIT_WITH_LOGS_NOTIFICATION,
        true,
      );
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('should not show notification when committed files had no logs', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithoutLog = `+  return true;`;
      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithoutLog);

      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return { dispose: jest.fn() };
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Stage and commit
      await stateChangeCallback!();
      mockRepository.state.indexChanges = [];
      await stateChangeCallback!();

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not mark as shown when notification is blocked by cooldown', async () => {
      const context = makeExtensionContext();
      let stateChangeCallback: () => Promise<void>;

      const mockUri = { fsPath: '/test/file.ts' } as vscode.Uri;
      const mockDocument = { languageId: 'typescript' } as vscode.TextDocument;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockShowNotification.mockResolvedValue(false); // Blocked
      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const diffWithLog = `+  console.log('test');`;
      const mockDiffIndexWithHEAD = jest.fn().mockResolvedValue(diffWithLog);

      const mockDisposable = { dispose: jest.fn() };
      const mockOnDidChange = jest.fn((callback) => {
        stateChangeCallback = callback;
        return mockDisposable;
      });

      const mockRepository = {
        state: {
          onDidChange: mockOnDidChange,
          indexChanges: [{ uri: mockUri, status: 0 }],
          workingTreeChanges: [],
        },
        diffIndexWithHEAD: mockDiffIndexWithHEAD,
      };

      const mockGitAPI = {
        repositories: [mockRepository],
        onDidOpenRepository: jest.fn(() => ({ dispose: jest.fn() })),
      };

      const mockGitExtension = {
        getAPI: jest.fn().mockReturnValue(mockGitAPI),
      };

      const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
      mockGetExtension.mockReturnValue({ exports: mockGitExtension });

      listenToCommitWithLogs(context, testVersion);

      // Stage and commit
      await stateChangeCallback!();
      mockRepository.state.indexChanges = [];
      await stateChangeCallback!();

      expect(mockShowNotification).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockDisposable.dispose).not.toHaveBeenCalled();
    });
  });
});
