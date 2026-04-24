import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import {
  readFromGlobalState,
  writeToGlobalState,
  getExtensionProperties,
  activateRepairMode,
  activateFreemiumLauncherMode,
  traceExtensionVersionHistory,
  updateUserActivityStatus,
  initialWorkspaceLogsCount,
  setupNotificationListeners,
} from './helpers';
import { isTestMode } from './runTime';
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

  // Create launcher view first
  const freemiumLauncherProvider = new TurboFreemiumLauncherPanel();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      TurboFreemiumLauncherPanel.viewType,
      freemiumLauncherProvider,
    ),
  );
  const launcherView = vscode.window.createTreeView(
    TurboFreemiumLauncherPanel.viewType,
    {
      treeDataProvider: freemiumLauncherProvider,
    },
  );

  // Register all commands with launcherView reference
  const commands: Array<Command> = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler({
        extensionProperties,
        debugMessage: jsDebugMessage,
        args,
        context,
        launcherView,
      });
    });
  }

  // Register remaining webview panels
  const turboProShowCasePanel = new TurboProShowcasePanel(
    context,
    launcherView,
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProShowcasePanel.viewType,
      turboProShowCasePanel,
    ),
  );

  const turboProBundleRepairPanel = new TurboProBundleRepairPanel('', 'run');
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProBundleRepairPanel.viewType,
      turboProBundleRepairPanel,
    ),
  );

  // Get current extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Update user activity status (ACTIVE/INACTIVE based on 7-day window)
  // Must run before traceExtensionVersionHistory since update reporting relies on this
  updateUserActivityStatus(context);

  // Trace version history and handle fresh install welcome
  // (creates or updates version array in global state + shows welcome for new users)
  traceExtensionVersionHistory(context, version);

  // Check Pro user status early to optimize notification setup
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(context, 'pro-bundle');
  const proBundleVersion = readFromGlobalState<string>(context, 'version');
  const isProUser = proLicenseKey !== undefined && proBundle !== undefined;

  // Sets up all notification event listeners (file opening + other triggers)
  // Skipped entirely for Pro users since they don't see marketing notifications
  if (!isProUser) {
    setupNotificationListeners(context, version);
  }

  if (!isTestMode() && isProUser) {
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

    // Clear freemium launcher badge before activating Pro
    launcherView.badge = undefined;

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

  // Count initial workspace logs and potentially show notification (with error handling)
  // Wait for completion before making panel accessible to avoid empty state
  try {
    await initialWorkspaceLogsCount(
      extensionProperties,
      launcherView,
      context,
      version,
    );
  } catch (error) {
    console.error(
      '[Extension] Failed to initialize workspace log count:',
      error,
    );
    // On error, set metadata to null to skip analytics section in panel
    writeToGlobalState(context, 'WORKSPACE_LOG_METADATA', null);
    // Make panel accessible (will show Pro features only, no analytics)
  } finally {
    // Activate freemium launcher for non-Pro users
    activateFreemiumLauncherMode(context, launcherView);
  }
}
