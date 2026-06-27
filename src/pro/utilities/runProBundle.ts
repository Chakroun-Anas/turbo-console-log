import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import fastGlob from 'fast-glob';
import pLimit from 'p-limit';
import * as net from 'net';
import * as os from 'os';
import * as crypto from 'crypto';
import * as childProcess from 'child_process';
import { ExtensionProperties } from '../../entities';
import { activateProMode, deactivateRepairMode } from '../../helpers';

// The Pro bundle's `disposeIPCServer`, captured after a successful run so the
// extension's deactivate() can tear the pre-commit IPC server down. The bundle
// is eval'd via `new Function`, so the core can't import it statically — it
// reads the function off the bundle's exports here and holds the reference.
let proBundleDispose: (() => void) | null = null;

/**
 * Disposes resources held by the running Pro bundle (currently the pre-commit
 * IPC server). Safe to call when no bundle is active — it's a no-op. Intended
 * for the extension's `deactivate()` lifecycle hook.
 */
export function disposeProBundle(): void {
  try {
    proBundleDispose?.();
  } catch (error) {
    console.error('Error disposing Turbo Console Log Pro:', error);
  } finally {
    proBundleDispose = null;
  }
}

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
    'fastGlob',
    'pLimit',
    'net',
    'os',
    'crypto',
    'childProcess',
    proBundle,
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
    net,
    os,
    crypto,
    childProcess,
  );

  const turboConsoleLogPro =
    exports.turboConsoleLogPro || module.exports?.turboConsoleLogPro;
  if (typeof turboConsoleLogPro === 'function') {
    try {
      await turboConsoleLogPro(extensionProperties, context);
      // Capture the bundle's disposer (if any) so deactivate() can stop the
      // pre-commit IPC server cleanly.
      const disposeIPCServer =
        exports.disposeIPCServer || module.exports?.disposeIPCServer;
      proBundleDispose =
        typeof disposeIPCServer === 'function'
          ? (disposeIPCServer as () => void)
          : null;
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
