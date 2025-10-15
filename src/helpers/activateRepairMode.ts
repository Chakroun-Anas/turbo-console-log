import { ExtensionProperties } from '@/entities';
import { TurboProBundleRepairPanel } from '@/pro';
import { runProBundle, updateProBundle } from '@/pro/utilities';
import * as vscode from 'vscode';

type RepairMode = {
  context: vscode.ExtensionContext;
  turboProBundleRepairPanel: TurboProBundleRepairPanel;
  reason: string;
  version: string;
  proLicenseKey: string;
  config: ExtensionProperties;
  proBundle: string;
  mode: 'run' | 'update';
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

export function activateRepairMode({
  context,
  version,
  proLicenseKey,
  config,
  turboProBundleRepairPanel,
  mode,
  proBundle,
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
      registerRunProBundleCommand({
        proBundle,
        config,
        turboProBundleRepairPanel,
        context,
      });
      break;
    case 'update':
      registerRetryProUpdateCommand({
        context,
        version,
        proLicenseKey,
        config,
        turboProBundleRepairPanel,
      });
      break;
    default:
      throw new Error(`Unknown repair mode: ${mode}`);
  }
}
