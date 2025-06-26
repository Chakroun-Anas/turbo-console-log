import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import os from 'os';
import pLimit from 'p-limit';
import { ExtensionProperties } from '../../entities';
import { activateProMode, deactivateRepairMode } from '../../helpers';
import { detectAll } from '../../debug-message/js/JSDebugMessage/detectAll';
import { logFunctionToUse } from '../../debug-message/js/JSDebugMessage/detectAll/helpers';

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
    'ignore',
    'os',
    'pLimit',
    'detectAll',
    'logFunctionToUse',
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
    logFunctionToUse,
  );

  const turboConsoleLogPro =
    exports.turboConsoleLogPro || module.exports?.turboConsoleLogPro;
  if (typeof turboConsoleLogPro === 'function') {
    try {
      turboConsoleLogPro(extensionProperties);
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
