import { ExtensionProperties } from '@/entities';
import { TurboProBundleRepairPanel } from '@/pro';
import {
  runProBundle,
  updateProBundle,
  fetchTrialBundle,
} from '@/pro/utilities';
import {
  TrialCountdownTimer,
  createTrialExpiredStatusBar,
} from '../pro/TrialCountdownTimer';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { AxiosError } from 'axios';
import * as vscode from 'vscode';

type RepairMode = {
  context: vscode.ExtensionContext;
  turboProBundleRepairPanel: TurboProBundleRepairPanel;
  reason: string;
  version: string;
  proLicenseKey?: string;
  config: ExtensionProperties;
  proBundle?: string;
  trialKey?: string;
  trialBundle?: string;
  mode: 'run' | 'update' | 'trial-fetch' | 'trial-run';
};

async function registerRetryProUpdateCommand({
  context,
  version,
  proLicenseKey,
  config,
  turboProBundleRepairPanel,
}: Pick<
  RepairMode,
  | 'context'
  | 'version'
  | 'proLicenseKey'
  | 'config'
  | 'turboProBundleRepairPanel'
>): Promise<void> {
  const commandName = 'turboConsoleLog.retryProUpdate';
  const commands = await vscode.commands.getCommands(true);
  if (commands.includes(commandName)) {
    return;
  }
  vscode.commands.registerCommand(commandName, async () => {
    try {
      if (!proLicenseKey) {
        throw new Error('No Pro license key found');
      }
      await updateProBundle(context, version, proLicenseKey, config);
    } catch (error) {
      turboProBundleRepairPanel.updateView(
        'update',
        (error as { message?: string })?.message ?? '',
      );
    }
  });
}

async function registerRunProBundleCommand({
  proBundle,
  config,
  turboProBundleRepairPanel,
  context,
}: Pick<RepairMode, 'config' | 'turboProBundleRepairPanel'> & {
  proBundle: string;
  context: vscode.ExtensionContext;
}): Promise<void> {
  const commandName = 'turboConsoleLog.retryProBundleRun';
  const commands = await vscode.commands.getCommands(true);
  if (commands.includes(commandName)) {
    return;
  }
  vscode.commands.registerCommand(commandName, async () => {
    try {
      await runProBundle(config, proBundle, context);
    } catch (error) {
      turboProBundleRepairPanel.updateView(
        'run',
        (error as { message?: string })?.message ?? '',
      );
    }
  });
}

async function registerRetryTrialFetchCommand({
  context,
  version,
  trialKey,
  config,
  turboProBundleRepairPanel,
}: Pick<
  RepairMode,
  'context' | 'version' | 'trialKey' | 'config' | 'turboProBundleRepairPanel'
>): Promise<void> {
  const commandName = 'turboConsoleLog.retryTrialFetch';
  const commands = await vscode.commands.getCommands(true);
  if (commands.includes(commandName)) {
    return;
  }
  vscode.commands.registerCommand(commandName, async () => {
    try {
      if (!trialKey) {
        throw new Error('No trial key found');
      }

      // Attempt to fetch trial bundle again
      const { bundle, expiresAt } = await fetchTrialBundle(trialKey, version);

      // Validate server-returned expiration date
      const now = new Date();
      if (now >= expiresAt) {
        // Server returned expired date
        writeToGlobalState(context, 'trial-key', undefined);
        writeToGlobalState(context, 'trial-expires-at', undefined);
        vscode.window.showErrorMessage(
          '❌ Trial has expired. Please request a new trial or upgrade to Pro.',
        );
        return;
      }

      // Run bundle in memory (ephemeral) - separate error handling
      try {
        await runProBundle(config, bundle, context);
      } catch (runError) {
        // Fetch succeeded, but run failed - show error and stay in fetch mode
        // Next retry will fetch and run again
        console.error(
          '[Trial] Bundle run failed after successful fetch:',
          runError,
        );
        turboProBundleRepairPanel.updateView(
          'trial-fetch',
          `Bundle execution error: ${(runError as { message?: string })?.message ?? 'Failed to run trial bundle'}`,
        );
        return;
      }

      // Update expiration time
      writeToGlobalState(context, 'trial-expires-at', expiresAt.toISOString());
      writeToGlobalState(context, 'trial-status', 'active');

      // Start countdown timer with expiration callback
      const onExpired = async () => {
        console.log('[Trial] Trial expired via countdown (in repair mode)');

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
      context.subscriptions.push(timer);

      // Exit repair mode and show success
      vscode.commands.executeCommand(
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      );
      vscode.commands.executeCommand(
        'setContext',
        'turboConsoleLog:isPro',
        true,
      );
    } catch (error) {
      // Axios throws for any non-2xx status AND for network errors
      const axiosError = error instanceof AxiosError ? error : null;

      if (axiosError?.response) {
        // Server responded with an error status
        const serverErrorMsg = axiosError.response.data?.error;
        const statusCode = axiosError.response.status;

        if (statusCode === 403) {
          // ForbiddenError: Trial not found, expired, or machine conflict
          // These are permanent trial issues - wipe metadata
          writeToGlobalState(context, 'trial-key', undefined);
          writeToGlobalState(context, 'trial-expires-at', undefined);
          vscode.window.showErrorMessage(
            serverErrorMsg
              ? `❌ ${serverErrorMsg}`
              : '❌ Trial validation failed. Please request a new trial key.',
          );
        } else {
          // 500 InternalError or other server errors - keep trying
          turboProBundleRepairPanel.updateView(
            'trial-fetch',
            serverErrorMsg ?? 'Server error: Unable to validate trial',
          );
        }
      } else {
        // Network or client error - keep trying, show error in repair panel
        turboProBundleRepairPanel.updateView(
          'trial-fetch',
          (error as { code?: string })?.code ??
            'Network error: Unable to reach server',
        );
      }
    }
  });
}

async function registerRetryTrialRunCommand({
  trialBundle,
  config,
  turboProBundleRepairPanel,
  context,
}: Pick<RepairMode, 'config' | 'turboProBundleRepairPanel'> & {
  trialBundle: string;
  context: vscode.ExtensionContext;
}): Promise<void> {
  const commandName = 'turboConsoleLog.retryTrialRun';
  const commands = await vscode.commands.getCommands(true);
  if (commands.includes(commandName)) {
    return;
  }
  vscode.commands.registerCommand(commandName, async () => {
    try {
      await runProBundle(config, trialBundle, context);
      // Exit repair mode on success
      vscode.commands.executeCommand(
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      );
      vscode.commands.executeCommand(
        'setContext',
        'turboConsoleLog:isPro',
        true,
      );
      vscode.window.showInformationMessage(
        '✅ Trial bundle running successfully! Pro features are now active.',
      );
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    } catch (error) {
      turboProBundleRepairPanel.updateView(
        'trial-run',
        (error as { message?: string })?.message ?? '',
      );
    }
  });
}

export function activateRepairMode({
  context,
  version,
  proLicenseKey,
  config,
  turboProBundleRepairPanel,
  mode,
  proBundle,
  trialKey,
  trialBundle,
  reason,
}: RepairMode): void {
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isRepairMode',
    true,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
  turboProBundleRepairPanel.updateView(mode, reason);
  switch (mode) {
    case 'run':
      if (!proBundle) {
        throw new Error('proBundle is required for run mode');
      }
      registerRunProBundleCommand({
        proBundle,
        config,
        turboProBundleRepairPanel,
        context,
      });
      break;
    case 'update':
      if (!proLicenseKey) {
        throw new Error('proLicenseKey is required for update mode');
      }
      registerRetryProUpdateCommand({
        context,
        version,
        proLicenseKey,
        config,
        turboProBundleRepairPanel,
      });
      break;
    case 'trial-fetch':
      if (!trialKey) {
        throw new Error('trialKey is required for trial-fetch mode');
      }
      registerRetryTrialFetchCommand({
        context,
        version,
        trialKey,
        config,
        turboProBundleRepairPanel,
      });
      break;
    case 'trial-run':
      if (!trialBundle) {
        throw new Error('trialBundle is required for trial-run mode');
      }
      registerRetryTrialRunCommand({
        trialBundle,
        config,
        turboProBundleRepairPanel,
        context,
      });
      break;
    default:
      throw new Error(`Unknown repair mode: ${mode}`);
  }
}
