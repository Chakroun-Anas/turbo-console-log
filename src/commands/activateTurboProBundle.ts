import * as vscode from 'vscode';
import * as dns from 'dns';
import fs from 'fs';
import path from 'path';
import axios, { AxiosError } from 'axios';
import { Command, ExtensionProperties } from '../entities';
import { detectAll } from '../debug-message/js/JSDebugMessage/detectAll';
import { showNotification } from '../ui';
import { writeToGlobalState } from '../helpers';

/**
 * Check internet connectivity
 * @returns internet connection status - Promise<boolean>
 */
function isOnline(): Promise<boolean> {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err);
    });
  });
}

function writeProBundleToCache(
  context: vscode.ExtensionContext,
  licenseKey: string,
  proBundle: string,
  version: string,
): void {
  writeToGlobalState(context, 'license-key', licenseKey);
  writeToGlobalState(context, 'pro-bundle', proBundle);
  writeToGlobalState(context, 'version', version);
}

export function proBundleNeedsUpdate(
  currentVersion: string,
  proBundleVersion?: string,
): boolean {
  function compareVersions(v1: string, v2?: string): number {
    if (!v2) return 1;
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const numA = a[i] ?? 0;
      const numB = b[i] ?? 0;
      if (numA > numB) return 1;
      if (numA < numB) return -1;
    }
    return 0;
  }
  return compareVersions(currentVersion, proBundleVersion) > 0;
}

export async function updateProBundle(
  context: vscode.ExtensionContext,
  proVersion: string,
  licenseKey: string,
  extensionProperties: ExtensionProperties,
) {
  const isUserConnectedToInternet = await isOnline();

  if (!isUserConnectedToInternet) {
    await vscode.window.showErrorMessage(
      '📡 No internet connection. Please connect and try again.',
    );
    return;
  }
  try {
    const proBundle = await fetchProBundle(licenseKey, proVersion);
    writeProBundleToCache(context, licenseKey, proBundle, proVersion);
    runProBundle(extensionProperties, proBundle);
    showNotification(
      `Pro Bundle Updated Successfully v${proVersion} 🚀 🎉`,
      10000,
    );
  } catch (error) {
    console.error('Turbo Pro activation failed: ', error);
    const genericErrorMsg =
      'Something went wrong, please contact the support at support@turboconsolelog.io';
    if (error instanceof AxiosError) {
      const errorMsg = error.response?.data?.error;
      vscode.window.showErrorMessage(errorMsg ?? genericErrorMsg);
      return;
    }
    showNotification(
      'Something went wrong, please contact the support at support@turboconsolelog.io',
      5000,
    );
  }
}

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
  }
}

async function fetchProBundle(
  licenseKey: string,
  proVersion: string,
): Promise<string> {
  const response = await axios.get(
    'https://www.turboconsolelog.io/api/activateTurboProBundle',
    {
      params: {
        licenseKey,
        targetVersion: proVersion,
      },
    },
  );
  return response.data.turboProBundle;
}

export function activateTurboProBundleCommand(): Command {
  return {
    name: 'turboConsoleLog.activateTurboProBundle',
    handler: async ({ extensionProperties, context }) => {
      const licenseKey = (
        await vscode.window.showInputBox({
          placeHolder: 'Enter your Turbo Pro license key',
          prompt:
            'Paste the license key you received by email to activate Turbo Console Log Pro',
          ignoreFocusOut: true, // Keeps it open if user clicks outside
        })
      )?.trim();

      if (!licenseKey) {
        const result = await vscode.window.showWarningMessage(
          'Pro Activation cancelled — no license key entered!',
          'Try Again',
          'Cancel',
        );
        if (result === 'Try Again') {
          vscode.commands.executeCommand(
            'turboConsoleLog.activateTurboProBundle',
          );
        }
        return;
      }

      const isUserConnectedToInternet = await isOnline();

      if (!isUserConnectedToInternet) {
        await vscode.window.showErrorMessage(
          '📡 No internet connection. Please connect and try again.',
        );
        return;
      }

      try {
        // Network request to check the key validation
        const version = vscode.extensions.getExtension(
          'ChakrounAnas.turbo-console-log',
        )?.packageJSON.version;
        const proBundle = await fetchProBundle(licenseKey, version);
        runProBundle(extensionProperties, proBundle);
        writeProBundleToCache(context, licenseKey, proBundle, version);
        showNotification(
          'Turbo Console Log Pro Activated Successfully 🚀 🎉',
          10000,
        );
      } catch (error) {
        console.error('Turbo Pro activation failed: ', error);
        const genericErrorMsg =
          'Something went wrong, please contact the support at support@turboconsolelog.io';
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          vscode.window.showErrorMessage(errorMsg ?? genericErrorMsg);
          return;
        }
        showNotification(
          'Something went wrong, please contact the support at support@turboconsolelog.io',
          5000,
        );
      }
    },
  };
}
