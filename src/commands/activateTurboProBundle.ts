import * as vscode from 'vscode';
import { Command } from '../entities';
import { showNotification } from '../ui';
import { AxiosError } from 'axios';
import {
  fetchProBundle,
  runProBundle,
  writeProBundleToCache,
} from '../pro/utilities';
import { isOnline } from '../pro/utilities/isOnline';
import { writeToGlobalState } from '../helpers';

export function activateTurboProBundleCommand(): Command {
  return {
    name: 'turboConsoleLog.activateTurboProBundle',
    handler: async ({ extensionProperties, context, launcherView }) => {
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

      // Validate license key format
      if (!licenseKey.startsWith('TCLP-')) {
        const result = await vscode.window.showErrorMessage(
          '❌ Invalid license key format. License keys start with "TCLP-"',
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

        // Clear freemium launcher badge before activating Pro
        if (launcherView) {
          launcherView.badge = undefined;
        }

        // Clean up any active trial metadata (if user purchases Pro during trial)
        // The countdown timer will stop automatically on next tick or reload
        writeToGlobalState(context, 'trial-key', undefined);
        writeToGlobalState(context, 'trial-expires-at', undefined);
        writeToGlobalState(context, 'trial-status', undefined);

        runProBundle(extensionProperties, proBundle, context);
        writeProBundleToCache(context, licenseKey, proBundle, version);
        showNotification(
          '🎉 Turbo Console Log Pro Activated, reload your window please!',
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
