import fs from 'fs';
import vscode from 'vscode';
import pLimit from 'p-limit';
import fastGlob from 'fast-glob';
import { ExtensionProperties, Message } from '@/entities';
import { GitIgnoreMatcher } from './GitIgnoreMatcher';
import { detectAll as phpDetectAll } from '@/debug-message/php/detectAll';
import { detectAll as jsDetectAll } from '@/debug-message/js/JSDebugMessage/detectAll';
import { filesToWatch } from './targetFiles';

/**
 * Collect all files with log messages using fast-glob for parallel directory scanning.
 */
export async function collectFilesWithLogs(
  dir: string,
  config: ExtensionProperties,
  ignoreMatcher: GitIgnoreMatcher,
): Promise<Map<string, Array<Message>>> {
  const filesLogsMap: Map<string, Array<Message>> = new Map();

  try {
    // Step 1: Use essential ignore patterns for fast-glob (broad strokes only)
    const essentialPatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.cache/**',
      '**/vendor/**',
    ];

    // Step 2: Use fast-glob with essential patterns only
    const allFiles = await fastGlob([filesToWatch], {
      cwd: dir,
      absolute: true,
      ignore: essentialPatterns,
      dot: false,
      onlyFiles: true,
      stats: false,
    });

    // Step 3: Filter with GitIgnoreMatcher for project-specific .gitignore rules
    const filteredFiles = allFiles.filter((filePath) => {
      if (ignoreMatcher.ignores(filePath)) {
        return false;
      }
      return true;
    });

    // Step 4: Process files with detectAll
    const limit = pLimit(16);

    await Promise.all(
      filteredFiles.map((filePath) =>
        limit(async () => {
          try {
            // Determine which detectAll to use based on file extension
            const isPHP = filePath.endsWith('.php');
            let logs: Array<Message> = [];
            if (isPHP) {
              logs = await phpDetectAll(
                filePath,
                config.logFunction,
                config.logMessagePrefix,
                config.delimiterInsideMessage,
              );
            } else {
              logs = await jsDetectAll(
                fs,
                vscode,
                filePath,
                config.logFunction,
                config.logMessagePrefix,
                config.delimiterInsideMessage,
              );
            }
            if (logs.length > 0) {
              filesLogsMap.set(filePath, logs);
            }
          } catch (error) {
            console.warn(`Skipped file (detectAll error): ${filePath}`, error);
          }
        }),
      ),
    );
  } catch (error) {
    console.error('Error collecting files with logs:', error);
  }

  return filesLogsMap;
}
