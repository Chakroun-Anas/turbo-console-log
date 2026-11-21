/**
 * Integration tests for the workspace log scan that runs on activation
 * (GitIgnoreMatcher.init + collectFilesWithLogs, driven by
 * initialWorkspaceLogsCount).
 *
 * Everything runs for real against a small folder written to disk: the file
 * system, fast-glob, the .gitignore matcher and log detection. Only `vscode`
 * is mocked. fast-glob is wrapped so that every folder it reads is recorded,
 * and the walk is stopped after a fixed number of reads, so a runaway walk
 * fails the test instead of exhausting the Jest worker's memory.
 *
 * Both scans swallow their errors, so the assertions look at the recorded
 * reads and at the saved workspace metadata, never at a thrown error.
 *
 * Covers:
 * - GitHub issue #386: hidden folders (e.g. `.claude/worktrees`) are walked,
 *   including every `node_modules` inside them.
 * - GitHub issue #385: symlink loops are followed until memory runs out.
 * - The behaviour change the #385 fix brings: symlinked folders are no
 *   longer scanned.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as vscode from 'vscode';
import type { Options } from 'fast-glob';
import {
  initialWorkspaceLogsCount,
  WorkspaceLogMetadata,
} from '@/helpers/initialWorkspaceLogsCount/initialWorkspaceLogsCount';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { extensionPropertiesMock } from '@/jest-tests/mocks/extensionPropertiesMock';

// Far above what a correct scan of the fixtures below needs (a few dozen reads).
const mockReadCap = 2000;

const mockScan = {
  root: '',
  foldersRead: [] as string[],
};

jest.mock('fast-glob', () => {
  const realFastGlob = jest.requireActual('fast-glob');
  const realFs = jest.requireActual('fs');

  const countingFastGlob = (patterns: string | string[], options?: Options) =>
    realFastGlob(patterns, {
      ...options,
      fs: {
        readdir: (directory: string, ...rest: unknown[]) => {
          const callback = rest[rest.length - 1] as (error: Error) => void;
          if (mockScan.foldersRead.length >= mockReadCap) {
            process.nextTick(callback, new Error('READ_CAP_HIT'));
            return;
          }
          mockScan.foldersRead.push(directory);
          return realFs.readdir(directory, ...rest);
        },
      },
    });

  return { __esModule: true, default: countingFastGlob };
});

function writeFile(relativePath: string, content = ''): void {
  const absolutePath = path.join(mockScan.root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function linkFolder(relativePath: string, target: string): void {
  const absolutePath = path.join(mockScan.root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.symlinkSync(target, absolutePath, 'dir');
}

function foldersReadUnder(relativeFolder: string): string[] {
  return mockScan.foldersRead
    .map((folder) => path.relative(mockScan.root, folder))
    .filter((folder) => folder.startsWith(relativeFolder + path.sep));
}

async function scanWorkspace(): Promise<WorkspaceLogMetadata | undefined> {
  const context = makeExtensionContext();
  const launcherView = { badge: undefined } as unknown as vscode.TreeView<string>;

  await initialWorkspaceLogsCount(extensionPropertiesMock, launcherView, context);

  const metadataCall = (context.globalState.update as jest.Mock).mock.calls.find(
    ([key]) => key === GlobalStateKey.WORKSPACE_LOG_METADATA,
  );
  return metadataCall?.[1];
}

const LOG_FILE = "const user = { name: 'Ada' };\nconsole.log(user);\n";

describe('workspace log scan on a real folder', () => {
  const workspace = vscode.workspace as unknown as {
    workspaceFolders?: unknown;
  };

  beforeEach(() => {
    mockScan.root = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'turbo-workspace-scan-')),
    );
    mockScan.foldersRead = [];
    workspace.workspaceFolders = [
      { uri: { fsPath: mockScan.root }, name: 'fixture', index: 0 },
    ];
    // Both scans log their swallowed errors; keep the test output readable.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete workspace.workspaceFolders;
    fs.rmSync(mockScan.root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('does not walk into hidden folders such as Claude worktrees (#386)', async () => {
    writeFile('.gitignore', 'node_modules\n');
    writeFile('src/app.ts', LOG_FILE);
    writeFile('node_modules/pkg/index.js');
    // A git worktree: a full checkout with its own dependencies.
    writeFile('.claude/worktrees/feature/.gitignore', 'node_modules\n');
    writeFile('.claude/worktrees/feature/src/app.ts', LOG_FILE);
    writeFile('.claude/worktrees/feature/node_modules/pkg/lib/index.js');

    const metadata = await scanWorkspace();

    expect(foldersReadUnder('.claude')).toEqual([]);
    expect(metadata?.totalLogs).toBe(1);
  });

  it('terminates on a branching symlink loop under a hidden folder (#385)', async () => {
    writeFile('src/app.ts', LOG_FILE);
    // Fixture from the issue: two hidden packages link to the app's
    // dependencies, which link back to both packages.
    writeFile('.hidden/a/.gitignore', '*.tmp\n');
    writeFile('.hidden/b/.gitignore', '*.tmp\n');
    fs.mkdirSync(path.join(mockScan.root, 'app/node_modules'), {
      recursive: true,
    });
    linkFolder('.hidden/a/node_modules', '../../app/node_modules');
    linkFolder('.hidden/b/node_modules', '../../app/node_modules');
    linkFolder('app/node_modules/a', '../../.hidden/a');
    linkFolder('app/node_modules/b', '../../.hidden/b');

    const metadata = await scanWorkspace();

    expect(mockScan.foldersRead.length).toBeLessThan(mockReadCap);
    expect(metadata?.totalLogs).toBe(1);
  });

  it('counts each file once when a symlink points back to the workspace root', async () => {
    writeFile('src/app.ts', LOG_FILE);
    writeFile('packages/lib/index.ts', LOG_FILE);
    linkFolder('packages/lib/workspace-root', '../..');

    const metadata = await scanWorkspace();

    expect(metadata?.totalFiles).toBe(2);
    expect(metadata?.totalLogs).toBe(2);
  });

  it('terminates on a branching symlink loop in a regular folder', async () => {
    writeFile('src/app.ts', LOG_FILE);
    writeFile('packages/lib/index.ts', LOG_FILE);
    linkFolder('packages/lib/parent-a', '..');
    linkFolder('packages/lib/parent-b', '..');

    const metadata = await scanWorkspace();

    expect(mockScan.foldersRead.length).toBeLessThan(mockReadCap);
    expect(metadata?.totalLogs).toBe(2);
  });

  it('does not scan a folder reached through a symlink', async () => {
    writeFile('src/app.ts', LOG_FILE);
    const outside = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'turbo-workspace-scan-outside-')),
    );
    try {
      fs.writeFileSync(path.join(outside, 'shared.ts'), LOG_FILE);
      linkFolder('src/shared', outside);

      const metadata = await scanWorkspace();

      expect(metadata?.totalFiles).toBe(1);
      expect(metadata?.totalLogs).toBe(1);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it('still finds the same files and applies nested .gitignore rules', async () => {
    writeFile('.gitignore', 'node_modules\ngenerated/\n');
    writeFile('src/app.ts', `${LOG_FILE}console.warn('careful');\n`);
    writeFile('src/generated/client.ts', LOG_FILE);
    writeFile('packages/lib/.gitignore', '*.local.ts\n');
    writeFile('packages/lib/index.js', LOG_FILE);
    writeFile('packages/lib/debug.local.ts', LOG_FILE);
    writeFile('dist/bundle.js', LOG_FILE);
    writeFile('node_modules/pkg/index.js', LOG_FILE);

    const metadata = await scanWorkspace();

    expect(metadata?.totalFiles).toBe(2);
    expect(metadata?.totalLogs).toBe(3);
    expect(foldersReadUnder('node_modules')).toEqual([]);
  });
});
