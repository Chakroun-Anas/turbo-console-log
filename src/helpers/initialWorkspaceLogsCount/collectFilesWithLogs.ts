import fs from 'fs';
import path from 'path';
import vscode from 'vscode';
import pLimit from 'p-limit';
import { ExtensionProperties, Message } from '@/entities';
import { folderWorkspaceTargetFiles } from './targetFiles';
import { GitIgnoreMatcher } from './GitIgnoreMatcher';

import { detectAll as jsDetectAll } from '@/debug-message/js/JSDebugMessage/detectAll';
import { detectAll as phpDetectAll } from '@/debug-message/php/detectAll';

/**
 * Internal recursive function that shares a single pLimit instance.
 * Directory traversal happens sequentially (outside limit).
 * Only file I/O operations use the limit.
 */
async function collectFilesWithLogsInternal(
  dir: string,
  limit: ReturnType<(typeof import('p-limit'))['default']>,
  config: ExtensionProperties,
  ignoreMatcher: GitIgnoreMatcher,
): Promise<Map<string, Array<Message>>> {
  const filesLogsMap: Map<string, Array<Message>> = new Map();
  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`⛔ Skipped missing or deleted directory: ${dir}`);
      return filesLogsMap;
    }
    throw err;
  }

  // Process entries - collect directories and file tasks
  const directories: string[] = [];
  const fileTasks: Promise<void>[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (ignoreMatcher.ignores(entryPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      // Collect directories to process after files
      directories.push(entryPath);
    } else if (folderWorkspaceTargetFiles.test(entry.name)) {
      // Collect file processing tasks (don't await yet!)
      fileTasks.push(
        limit(async () => {
          try {
            // Determine which detectAll to use based on file extension
            const isPHP = entryPath.endsWith('.php');
            let logs: Array<Message> = [];
            if (isPHP) {
              logs = await phpDetectAll(
                entryPath,
                config.logFunction,
                config.logMessagePrefix,
                config.delimiterInsideMessage,
              );
            } else {
              logs = await jsDetectAll(
                fs,
                vscode,
                entryPath,
                config.logFunction,
                config.logMessagePrefix,
                config.delimiterInsideMessage,
              );
            }
            if (logs.length > 0) {
              filesLogsMap.set(entryPath, logs);
            }
          } catch (error) {
            console.warn(`Skipped file (detectAll error): ${entryPath}`, error);
          }
        }),
      );
    }
  }

  // Process all files concurrently with limit
  await Promise.all(fileTasks);

  // Process subdirectories in parallel (they all share the same limit)
  const nestedResults = await Promise.all(
    directories.map((dirPath) =>
      collectFilesWithLogsInternal(dirPath, limit, config, ignoreMatcher),
    ),
  );

  // Merge all nested results into this map
  nestedResults.forEach((nestedMap) => {
    nestedMap.forEach((logs, filePath) => {
      filesLogsMap.set(filePath, logs);
    });
  });

  return filesLogsMap;
}

/**
 * Wrapper function that creates a single shared pLimit instance
 * and delegates to the internal recursive function.
 */
export async function collectFilesWithLogs(
  dir: string,
  config: ExtensionProperties,
  ignoreMatcher: GitIgnoreMatcher,
): Promise<Map<string, Array<Message>>> {
  // Create single shared limit instance for all file operations
  const limit = pLimit(16);

  // Do the actual work with the tracked limit
  const result = await collectFilesWithLogsInternal(
    dir,
    limit,
    config,
    ignoreMatcher,
  );

  return result;
}
