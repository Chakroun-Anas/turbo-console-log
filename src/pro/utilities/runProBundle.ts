import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import { ExtensionProperties } from '../../entities';
import { detectAll } from '../../debug-message/js/JSDebugMessage/detectAll';

export function runProBundle(
  extensionProperties: ExtensionProperties,
  proBundle: string,
): void {
  const exports: Record<string, unknown> = {};
  const module = { exports };

  const turboConsoleLogProFactory = new Function(
    'exports',
    'module',
    'vscode',
    'fs',
    'path',
    'detectAll',
    proBundle,
  );

  turboConsoleLogProFactory(exports, module, vscode, fs, path, detectAll);

  const turboConsoleLogPro =
    exports.turboConsoleLogPro || module.exports?.turboConsoleLogPro;
  if (typeof turboConsoleLogPro === 'function') {
    try {
      turboConsoleLogPro(extensionProperties);
    } catch (error) {
      console.error('Error running Turbo Console Log Pro:', error);
      throw new Error(
        'Failed to load Turbo Console Log Pro — the bundle may be corrupted. Please contact support@turboconsolelog.io',
      );
    }
    return;
  }
  throw new Error(
    'Pro bundle does not export turboConsoleLogPro. Activation failed. Please contact support@turboconsolelog.io',
  );
}
