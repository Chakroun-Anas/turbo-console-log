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

export function runProBundle(
  context: vscode.ExtensionContext,
  extensionProperties: ExtensionProperties,
  licenseKey: string,
  version: string,
  proBundle: string,
  isFromCache: boolean = false,
): void {
  const exports: Record<string, unknown> = {};
  const module = { exports };

  try {
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
      turboConsoleLogPro(extensionProperties);
      if (!isFromCache) {
        writeToGlobalState(context, 'license-key', licenseKey);
        writeToGlobalState(context, `pro-bundle-${version}`, proBundle);
        showNotification(
          'Turbo Console Log Pro Activated Successfully 🚀 🎉',
          10000,
        );
      }
    } else {
      vscode.window.showErrorMessage(
        'Failed to load Turbo Console Log Pro — the bundle may be corrupted. Please contact support@turboconsolelog.io',
      );
    }
  } catch (error) {
    console.error('❌ Failed to execute PRO bundle:', error);
    vscode.window.showErrorMessage(
      'Failed to activate PRO bundle. Please contact support@turboconsolelog.io',
    );
  }
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

      // FIXME: U DONT WANT TO CHIP ON PROD TARGETTING LOCALHOST :D
      try {
        // Network request to check the key validation

        const version = vscode.extensions.getExtension(
          'ChakrounAnas.turbo-console-log',
        )?.packageJSON.version;
        const res = await axios.get(
          'https://www.turboconsolelog.io/api/activateTurboProBundle',
          {
            params: {
              licenseKey,
              targetVersion: version,
            },
          },
        );

        const proBundle = res.data.turboProBundle;
        runProBundle(
          context,
          extensionProperties,
          licenseKey,
          version,
          proBundle,
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
