import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import os from 'os';
import pLimit from 'p-limit';
import { ExtensionProperties } from '../../entities';
import { activateProMode, deactivateRepairMode } from '../../helpers';
import { detectAll } from '../../debug-message/js/JSDebugMessage/detectAll';

export async function runProBundle(
  extensionProperties: ExtensionProperties,
  proBundle: string,
  context: vscode.ExtensionContext,
): Promise<void> {
  const exports: Record<string, unknown> = {};
  const module = { exports };

  const turboConsoleLogProFactory = new Function(
    'exports',
    'module',
    'vscode',
    'fs',
    'path',
    'ignore',
    'os',
    'pLimit',
    'detectAll',
    proBundle,
  );

  turboConsoleLogProFactory(
    exports,
    module,
    vscode,
    fs,
    path,
    ignore,
    os,
    pLimit,
    detectAll,
  );

  const turboConsoleLogPro =
    exports.turboConsoleLogPro || module.exports?.turboConsoleLogPro;
  if (typeof turboConsoleLogPro === 'function') {
    try {
      await turboConsoleLogPro(extensionProperties, context);
      deactivateRepairMode();
      activateProMode();
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
