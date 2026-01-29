import vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import ignore from 'ignore';
import type { Ignore } from 'ignore';

export class GitIgnoreMatcher {
  private matchers: Map<string, Ignore>; // Map of workspace root -> ignore matcher

  constructor() {
    this.matchers = new Map();
  }

  async init(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];

    // Initialize a matcher for each workspace folder
    for (const folder of workspaceFolders) {
      this.matchers.set(folder.uri.fsPath, ignore());
    }

    const gitIgnores = await vscode.workspace.findFiles('**/.gitignore');
    const limit = pLimit(16);
    const tasks = gitIgnores.map((uri) =>
      limit(async () => {
        // Find which workspace folder this .gitignore belongs to
        const gitignorePath = uri.fsPath;
        const workspaceFolder = workspaceFolders.find((folder) =>
          gitignorePath.startsWith(folder.uri.fsPath),
        );

        if (!workspaceFolder) return;

        const root = workspaceFolder.uri.fsPath;
        const matcher = this.matchers.get(root);
        if (!matcher) return;

        const rulesContent = await fs.promises.readFile(uri.fsPath, 'utf8');
        const folderOfGitignore = path.dirname(uri.fsPath);
        const scopedRules = rulesContent
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .map((line) =>
            path
              .join(path.relative(root, folderOfGitignore), line)
              .replace(/\\/g, '/'),
          );
        matcher.add(scopedRules);
      }),
    );

    await Promise.all(tasks);
  }

  ignores(absolutePath: string): boolean {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders ?? [];

      // Find which workspace folder this path belongs to
      const workspaceFolder = workspaceFolders.find((folder) =>
        absolutePath.startsWith(folder.uri.fsPath),
      );

      if (!workspaceFolder) return false;

      const root = workspaceFolder.uri.fsPath;
      const matcher = this.matchers.get(root);
      if (!matcher) return false;

      const relative = path.relative(root, absolutePath);

      // If relative path is empty (checking workspace root itself) or just '.', never ignore
      if (!relative || relative === '.') {
        return false;
      }

      return matcher.ignores(relative);
    } catch (error) {
      console.error(
        `Failed to check if path should be ignored "${absolutePath}":`,
        error instanceof Error ? error.message : error,
      );
      return true; // Assume problematic files should be ignored
    }
  }
}
