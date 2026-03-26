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
  updateUserActivityStatus,
  listenToManualConsoleLogs,
  listenToInactiveTwoWeeksReturn,
  listenToInactiveFourWeeksSurvey,
  listenToActivationDayThree,
  listenToActivationDaySeven,
  listenToJSMessyFileDetection,
  listenToPhpMessyFileDetection,
  listenToJSMultiLogTypes,
  listenToPhpMultiLogTypes,
  listenToWeekendTurboSundays,
  listenToCommitWithLogs,
  listenToCustomLogLibrary,
  listenToLogsInTestFile,
  initialWorkspaceLogsCount,
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

  // Listen to PHP file openings and show announcement immediately (v3.10.0 strategy)
  listenToPhpFileOpenings(context, version);

  // Listen to manual console.log typing for INACTIVE users (re-engagement strategy)
  listenToManualConsoleLogs(context);

  // Listen to JS/TS file openings for inactive users (14-28 days)
  listenToInactiveTwoWeeksReturn(context, version);

  // Listen to JS/TS file openings for long-term inactive users (28+ days) - show survey
  listenToInactiveFourWeeksSurvey(context, version);

  // Listen to JS/TS file openings for new users with zero usage (3-7 days activation nudge)
  listenToActivationDayThree(context, version);

  // Listen to JS/TS file openings for new users with zero usage (7-14 days final activation attempt)
  listenToActivationDaySeven(context, version);

  // Listen to JS/TS messy file detection and show notification
  listenToJSMessyFileDetection(context, version);

  // Listen to PHP messy file detection and show notification
  listenToPhpMessyFileDetection(context, version);

  // Listen to JS/TS multi-log-type detection and show notification
  listenToJSMultiLogTypes(context, version);

  // Listen to PHP multi-log-type detection and show notification
  listenToPhpMultiLogTypes(context, version);

  // Listen to Git commits with logs and show notification
  listenToCommitWithLogs(context, version);

  // Listen to custom logging library usage and show notification
  listenToCustomLogLibrary(context, version);

  // Listen to logs in test files and show notification
  listenToLogsInTestFile(context, version);

  // Show weekend Turbo Sundays article notification (if it's weekend)
  listenToWeekendTurboSundays(context, version);

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
    context.globalState.update('WORKSPACE_LOG_METADATA', null);
    // Make panel accessible (will show Pro features only, no analytics)
  } finally {
    // Activate freemium launcher for non-Pro users
    activateFreemiumLauncherMode(context, launcherView);
  }
}
