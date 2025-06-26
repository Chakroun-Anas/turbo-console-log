import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import {
  readFromGlobalState,
  getExtensionProperties,
  activateRepairMode,
  activateFreemiumMode,
} from './helpers';
import {
  TurboProBundleRepairPanel,
  TurboProFreemiumTreeProvider,
  TurboProShowcasePanel,
} from './pro';
import { showReleaseHtmlWebViewAndNotification } from './ui/helpers';
import {
  releaseNotes,
  getLatestWebViewReleaseVersion,
  getPreviousWebViewReleaseVersion,
} from './releases';
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

  const turboProShowCasePanel = new TurboProShowcasePanel();
  const turboProBundleRepairPanel = new TurboProBundleRepairPanel('');
  const freemiumProvider = new TurboProFreemiumTreeProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProShowcasePanel.viewType,
      turboProShowCasePanel,
    ),
  );
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'turboConsoleLogProView',
      freemiumProvider,
    ),
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProBundleRepairPanel.viewType,
      turboProBundleRepairPanel,
    ),
  );

  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;
  const previousWebViewReleaseVersion = getPreviousWebViewReleaseVersion();
  const latestWebViewReleaseVersion = getLatestWebViewReleaseVersion();
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(context, 'pro-bundle');
  const proBundleVersion = readFromGlobalState<string>(context, 'version');
  showReleaseHtmlWebViewAndNotification(
    context,
    previousWebViewReleaseVersion,
    latestWebViewReleaseVersion,
  );
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
        turboProBundleRepairPanel.setProBundleRemovalReason(
          (error as { message?: string })?.message ?? '',
        );
        activateRepairMode();
        vscode.commands.registerCommand(
          'turboConsoleLog.retryProUpdate',
          async () => {
            try {
              await updateProBundle(
                context,
                version,
                proLicenseKey,
                extensionProperties,
              );
            } catch (error) {
              turboProBundleRepairPanel.setProBundleRemovalReason(
                (error as { message?: string })?.message ?? '',
              );
            }
          },
        );
        return;
      }
      return;
    }
    runProBundle(extensionProperties, proBundle);
    return;
  }
  activateFreemiumMode();
}
