import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import fastGlob from 'fast-glob';
import pLimit from 'p-limit';
import { ExtensionProperties } from '../../entities';
import { activateProMode, deactivateRepairMode } from '../../helpers';
import { detectAll as detectAllJs } from '../../debug-message/js/JSDebugMessage/detectAll';
import { detectAll as detectAllPhp } from '../../debug-message/php/detectAll';
import { detectAll as detectAllPython } from '../../debug-message/python/detectAll';
import { showNotification } from '../../notifications/showNotification';
import { NotificationEvent } from '../../notifications/NotificationEvent';

async function detectAllForProBundle(
  fsModule: typeof import('fs'),
  vscodeModule: typeof import('vscode'),
  filePath: string,
  logFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
) {
  const normalizedPath = filePath.toLowerCase();

  if (normalizedPath.endsWith('.php')) {
    console.log('[Pro] Processing PHP file:', filePath);
    // PHP detectAll only takes 4 parameters (filePath, logFunction, prefix, delimiter)
    return detectAllPhp(
      filePath,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  }

  if (normalizedPath.endsWith('.py')) {
    console.log('[Pro] Processing Python file:', filePath);
    return detectAllPython(
      fsModule,
      vscodeModule,
      filePath,
      logFunction,
      logMessagePrefix,
      delimiterInsideMessage,
    );
  }

  return detectAllJs(
    fsModule,
    vscodeModule,
    filePath,
    logFunction,
    logMessagePrefix,
    delimiterInsideMessage,
  );
}

export async function runProBundle(
  extensionProperties: ExtensionProperties,
  proBundle: string,
  context: vscode.ExtensionContext,
  version: string,
): Promise<void> {
  console.log('[Pro] Starting Pro Bundle initialization...');
  
  // Patch the Pro bundle to include .py files in extension filtering
  let patchedBundle = proBundle;
  
  // Common patterns the Pro bundle might use for extension filtering:
  // ".js|.jsx|.ts|.tsx|.php" -> ".js|.jsx|.ts|.tsx|.php|.py"
  patchedBundle = patchedBundle.replace(
    /(['"])\.js\|\.jsx\|\.ts\|\.tsx\|\.php\1/g,
    '.js|.jsx|.ts|.tsx|.php|.py'
  );
  
  // Also try simpler pattern: extensions without quotes in regex
  patchedBundle = patchedBundle.replace(
    /\.js\|\.jsx\|\.ts\|\.tsx\|\.php(?=[\)\|\"])/g,
    '.js|.jsx|.ts|.tsx|.php|.py'
  );

  const exports: Record<string, unknown> = {};
  const module = { exports };

  const turboConsoleLogProFactory = new Function(
    'exports',
    'module',
    'vscode',
    'fs',
    'path',
    'ignore',
    'fastGlob',
    'pLimit',
    'detectAll',
    patchedBundle,
  );

  turboConsoleLogProFactory(
    exports,
    module,
    vscode,
    fs,
    path,
    ignore,
    fastGlob,
    pLimit,
    detectAllForProBundle,
  );

  const turboConsoleLogPro =
    exports.turboConsoleLogPro || module.exports?.turboConsoleLogPro;
  if (typeof turboConsoleLogPro === 'function') {
    try {
      console.log('[Pro] Invoking Pro bundle initialization with Python support...');
      await turboConsoleLogPro(extensionProperties, context);
      console.log('[Pro] Pro bundle initialized successfully with Python files');
      deactivateRepairMode();
      activateProMode();
      
      // Check if workspace has Python files and notify user
      try {
        const pythonFiles = await vscode.workspace.findFiles('**/*.py', '**/node_modules/**', 1);
        if (pythonFiles.length > 0) {
          console.log('[Pro] Python files detected in workspace, showing notification');
          await showNotification(
            NotificationEvent.EXTENSION_PYTHON_PRO_SUPPORT,
            version,
            context,
          );
        }
      } catch (notificationError) {
        // Silently ignore notification errors - Pro bundle already running successfully
        console.debug('[Pro] Could not show Python notification:', notificationError);
      }
    } catch (error) {
      console.error('Error running Turbo Console Log Pro:', error);
      throw new Error(
        'Failed to load Turbo Console Log Pro — the bundle may be corrupted!',
      );
    }
    return;
  }
  throw new Error(
    'Pro bundle does not export turboConsoleLogPro. Activation failed!',
  );
}
