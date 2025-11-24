import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import {
  readFromGlobalState,
  getExtensionProperties,
  activateRepairMode,
  activateFreemiumLauncherMode,
  traceExtensionVersionHistory,
  listenToPhpFileOpenings,
} from './helpers';
import {
  TurboFreemiumLauncherPanel,
  TurboProBundleRepairPanel,
  TurboProShowcasePanel,
} from './pro';
import { releaseNotes } from './releases';
import {
  proBundleNeedsUpdate,
  runProBundle,
  updateProBundle,
} from './pro/utilities';

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties: ExtensionProperties =
    getExtensionProperties(config);
  // Register all commands
  const commands: Array<Command> = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler({
        extensionProperties,
        debugMessage: jsDebugMessage,
        args,
        context,
      });
    });
  }

  // Register webview panels and tree views
  const turboProShowCasePanel = new TurboProShowcasePanel(context);
  const turboProBundleRepairPanel = new TurboProBundleRepairPanel('', 'run');
  const freemiumLauncherProvider = new TurboFreemiumLauncherPanel();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProShowcasePanel.viewType,
      turboProShowCasePanel,
    ),
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProBundleRepairPanel.viewType,
      turboProBundleRepairPanel,
    ),
  );
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      TurboFreemiumLauncherPanel.viewType,
      freemiumLauncherProvider,
    ),
  );

  // Get current extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Trace version history and handle fresh install welcome
  // (creates or updates version array in global state + shows welcome for new users)
  traceExtensionVersionHistory(context, version);

  // Listen to PHP file openings and show announcement immediately (v3.10.0 strategy)
  listenToPhpFileOpenings(context);

  // Handle Pro user logic
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(context, 'pro-bundle');
  const proBundleVersion = readFromGlobalState<string>(context, 'version');
  const isProUser = proLicenseKey !== undefined && proBundle !== undefined;
  if (isProUser) {
    if (
      releaseNotes[version]?.isPro &&
      proBundleNeedsUpdate(version, proBundleVersion)
    ) {
      try {
        await updateProBundle(
          context,
          version,
          proLicenseKey,
          extensionProperties,
        );
      } catch (error) {
        activateRepairMode({
          context,
          version,
          proLicenseKey,
          config: extensionProperties,
          turboProBundleRepairPanel,
          reason: (error as { message?: string })?.message ?? '',
          mode: 'update',
          proBundle,
        });
        return;
      }
      return;
    }
    try {
      await runProBundle(extensionProperties, proBundle, context);
    } catch (error) {
      activateRepairMode({
        context,
        version,
        proLicenseKey,
        config: extensionProperties,
        turboProBundleRepairPanel,
        reason: (error as { message?: string })?.message ?? '',
        mode: 'run',
        proBundle,
      });
      return;
    }
    return;
  }

  // Activate freemium launcher for non-Pro users
  activateFreemiumLauncherMode(context, freemiumLauncherProvider);
}
