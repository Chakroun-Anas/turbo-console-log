import type { Ignore } from 'ignore';
import fs from 'fs';
import path from 'path';
import vscode from 'vscode';
import ignore from 'ignore';
import pLimit from 'p-limit';
import fastGlob from 'fast-glob';

export class GitIgnoreMatcher {
  private matchers: Map<string, Ignore>; // Map of directory path -> ignore matcher for that directory
  private workspaceFolders: Array<{ uri: { fsPath: string } }>;
  private pathToRootCache: Map<string, string>; // Cache for path -> workspace root mapping

  constructor() {
    this.matchers = new Map();
    this.workspaceFolders = [];
    this.pathToRootCache = new Map();
  }

  async init(): Promise<void> {
    this.workspaceFolders = [...(vscode.workspace.workspaceFolders ?? [])];

    const workspaceRoot = this.workspaceFolders[0]?.uri.fsPath;
    if (!workspaceRoot) return;

    // Use fast-glob instead of vscode.workspace.findFiles to respect essential ignore patterns
    const gitIgnorePaths = await fastGlob(['**/.gitignore'], {
      cwd: workspaceRoot,
      absolute: true,
      ignore: ['**/node_modules/**'],
    });

    const limit = pLimit(16);

    const tasks = gitIgnorePaths.map((gitignorePath) =>
      limit(() => {
        try {
          const gitignoreDir = path.dirname(gitignorePath);

          // Read .gitignore content synchronously
          const rulesContent = fs.readFileSync(gitignorePath, 'utf8');

          // Parse rules (no path transformation - rules are relative to .gitignore location)
          const rules = rulesContent
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'));

          if (rules.length > 0) {
            // Create a matcher for this directory
            const matcher = ignore();
            matcher.add(rules);
            this.matchers.set(gitignoreDir, matcher);
          }
        } catch {
          // Silently skip failed .gitignore files
        }
      }),
    );

    await Promise.all(tasks);
  }

  ignores(absolutePath: string): boolean {
    try {
      // Fast path: check cache for parent directory's workspace root
      const parentDir = path.dirname(absolutePath);
      let root = this.pathToRootCache.get(parentDir);

      if (!root) {
        // Find which workspace folder this path belongs to
        const workspaceFolder = this.workspaceFolders.find((folder) =>
          absolutePath.startsWith(folder.uri.fsPath),
        );

        if (!workspaceFolder) return false;
        root = workspaceFolder.uri.fsPath;

        // Cache the parent directory -> root mapping
        this.pathToRootCache.set(parentDir, root);
      }

      // Get all ancestor directories from file location up to workspace root
      const ancestors: string[] = [];
      let currentDir = parentDir;

      while (currentDir.startsWith(root)) {
        ancestors.push(currentDir);
        if (currentDir === root) break;
        currentDir = path.dirname(currentDir);
      }

      // Check matchers from root down to file (respecting Git precedence)
      // Later .gitignore files (closer to file) can override earlier ones
      for (const dir of ancestors.reverse()) {
        const matcher = this.matchers.get(dir);
        if (matcher) {
          const relative = path.relative(dir, absolutePath);

          // The ignore library handles negation patterns correctly
          // So we check each matcher and let it modify the result
          if (matcher.ignores(relative)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error(
        `Failed to check if path should be ignored "${absolutePath}":`,
        error instanceof Error ? error.message : error,
      );
      return true; // Assume problematic files should be ignored
    }
  }
}
