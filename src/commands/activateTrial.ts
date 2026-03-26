import * as vscode from 'vscode';
import { Command } from '../entities';
import { AxiosError } from 'axios';
import { fetchTrialBundle, runProBundle } from '../pro/utilities';
import { isOnline } from '../pro/utilities/isOnline';
import {
  TrialCountdownTimer,
  createTrialExpiredStatusBar,
} from '../pro/TrialCountdownTimer';
import { writeToGlobalState } from '../helpers';

export function activateTrialCommand(): Command {
  return {
    name: 'turboConsoleLog.activateTrial',
    handler: async ({ extensionProperties, context, launcherView }) => {
      const trialKey = (
        await vscode.window.showInputBox({
          placeHolder: 'Enter your Turbo Pro trial key',
          prompt:
            'Paste the trial key you received by email to start your 2-hour trial',
          ignoreFocusOut: true, // Keeps it open if user clicks outside
        })
      )?.trim();

      if (!trialKey) {
        const result = await vscode.window.showWarningMessage(
          'Trial activation cancelled — no trial key entered!',
          'Try Again',
          'Cancel',
        );
        if (result === 'Try Again') {
          vscode.commands.executeCommand('turboConsoleLog.activateTrial');
        }
        return;
      }

      // Validate trial key format
      if (!trialKey.startsWith('TRIAL-')) {
        const result = await vscode.window.showErrorMessage(
          '❌ Invalid trial key format. Trial keys start with "TRIAL-"',
          'Try Again',
          'Cancel',
        );
        if (result === 'Try Again') {
          vscode.commands.executeCommand('turboConsoleLog.activateTrial');
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
        // Network request to validate trial and fetch bundle
        const version = vscode.extensions.getExtension(
          'ChakrounAnas.turbo-console-log',
        )?.packageJSON.version;

        const { bundle, expiresAt } = await fetchTrialBundle(trialKey, version);

        // Clear freemium launcher badge before activating Pro
        if (launcherView) {
          launcherView.badge = undefined;
        }

        // Run bundle in memory (DO NOT write to cache - trials are ephemeral)
        runProBundle(extensionProperties, bundle, context);

        // Reveal the Pro Guide panel to help users explore features
        try {
          await vscode.commands.executeCommand(
            'turboConsoleLogProTrialGuide.focus',
          );
        } catch {
          // Silently ignore if panel focus fails - not critical
        }

        // Store trial metadata for auto-activation on restart
        writeToGlobalState(context, 'trial-key', trialKey);
        writeToGlobalState(
          context,
          'trial-expires-at',
          expiresAt.toISOString(),
        );
        writeToGlobalState(context, 'trial-status', 'active');

        // Start countdown timer in status bar with expiration callback
        const onExpired = async () => {
          console.log('[Trial] Trial expired via countdown');

          // Clear trial metadata
          writeToGlobalState(context, 'trial-key', undefined);
          writeToGlobalState(context, 'trial-expires-at', undefined);
          writeToGlobalState(context, 'trial-status', 'expired');

          // Deactivate Pro mode - this automatically shows freemium launcher
          // (no reload needed - VS Code's "when" clauses handle view switching)
          vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isPro',
            false,
          );

          // Show expired status bar
          const expiredStatusBar = createTrialExpiredStatusBar();
          expiredStatusBar.show();
          context.subscriptions.push(expiredStatusBar);
        };

        const timer = new TrialCountdownTimer(
          expiresAt,
          context,
          version,
          onExpired,
        );
        timer.start();

        // Add timer to subscriptions for automatic cleanup on deactivation
        context.subscriptions.push(timer);

        vscode.window.showInformationMessage(
          '🎉 Turbo Console Log Pro Trial Activated! You have 2 hours to explore all features.',
        );
      } catch (error) {
        console.error('Trial activation failed: ', error);
        const genericErrorMsg =
          'Something went wrong, please contact the support at support@turboconsolelog.io';
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          vscode.window.showErrorMessage(errorMsg ?? genericErrorMsg);
          return;
        }
        vscode.window.showErrorMessage(
          'Something went wrong, please contact the support at support@turboconsolelog.io',
        );
      }
    },
  };
}
