import * as vscode from 'vscode';
import { Command, ExtensionProperties, GlobalStateKey } from './entities';
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
  shouldShowReleasePanel,
  resolveReleaseVersion,
  activateReleaseLauncherMode,
  createReleasePanelStatusBarItem,
} from './helpers';
import { isTestMode } from './runTime';
import {
  TurboFreemiumLauncherPanel,
  TurboProBundleRepairPanel,
  TurboProShowcasePanel,
  TurboReleasePanel,
  TurboReleaseLauncherPanel,
} from './pro';
import { releaseNotes } from './releases';
import { isCampaignLive } from './pro/campaign';
import {
  proBundleNeedsUpdate,
  runProBundle,
  disposeProBundle,
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
        args,
        context,
        launcherView,
      });
    });
  }

  // Resolve version early so release panel and show-release check can use it
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Falls back to the last entry in RELEASE_PANEL_VERSIONS when the current
  // version is a patch/minor that has no dedicated release panel
  const releaseVersion = resolveReleaseVersion(version);

  // Register release launcher (tree view) + release badge panel (webview).
  // These views are first contributed in v3.25.0's manifest, so on an in-place
  // UPDATE the already-running window hasn't registered the new container/views
  // yet — `createTreeView` throws "no view with id …" and VS Code surfaces a
  // (harmless) error toast. The views become available after the natural window
  // reload, so guard the setup and skip it silently until then.
  const releaseLauncherProvider = new TurboReleaseLauncherPanel(
    releaseVersion ?? version,
  );
  let releaseLauncherView: vscode.TreeView<string> | undefined;
  let releasePanelRegistrationWentWrong = false;
  try {
    context.subscriptions.push(
      vscode.window.registerTreeDataProvider(
        TurboReleaseLauncherPanel.viewType,
        releaseLauncherProvider,
      ),
    );
    releaseLauncherView = vscode.window.createTreeView(
      TurboReleaseLauncherPanel.viewType,
      { treeDataProvider: releaseLauncherProvider },
    );

    const releasePanelProvider = new TurboReleasePanel(
      context,
      releaseVersion ?? version,
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        TurboReleasePanel.viewType,
        releasePanelProvider,
      ),
    );
  } catch {
    // Release-panel views not yet registered in this window (pending the
    // post-update reload). Harmless — the panel comes up correctly after reload.
    releasePanelRegistrationWentWrong = true;
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

  // Update user activity status (ACTIVE/INACTIVE based on 7-day window)
  // Must run before traceExtensionVersionHistory since update reporting relies on this
  updateUserActivityStatus(context);

  // Trace version history and handle fresh install welcome
  // (creates or updates version array in global state + shows welcome for new users)
  traceExtensionVersionHistory(context, version);

  // Check Pro user status early — it gates the release panel below and
  // optimizes notification setup. Derived purely from global state, so it is
  // safe to read before any of the release/Pro activation sequences run.
  const proLicenseKey = readFromGlobalState<string>(
    context,
    GlobalStateKey.LICENSE_KEY,
  );
  const proBundle = readFromGlobalState<string>(
    context,
    GlobalStateKey.PRO_BUNDLE,
  );
  const proBundleVersion = readFromGlobalState<string>(
    context,
    GlobalStateKey.PRO_BUNDLE_VERSION,
  );
  const isProUser = proLicenseKey !== undefined && proBundle !== undefined;

  // Command to force-open the release panel from the status bar (bypasses shouldShowReleasePanel)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'turboConsoleLog.showReleasePanel',
      async () => {
        // If the release-panel views failed to register this session (in-place
        // update before reload), do NOT toggle isNewRelease on — it would hide
        // the freemium/Pro panels while the release panel itself can't render,
        // leaving a blank container. Everything works after the natural reload.
        // Pro users DO reach this path: the panel is never pushed at them, but
        // opening it on purpose is always allowed.
        if (releasePanelRegistrationWentWrong) {
          return;
        }
        try {
          await vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isInitialized',
            true,
          );
          await vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isNewRelease',
            true,
          );
          await vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isReleaseLauncherMode',
            false,
          );
          await vscode.commands.executeCommand(
            `${TurboReleasePanel.viewType}.focus`,
          );
        } catch {
          // Release panel view not available yet (pending post-update reload).
        }
      },
    ),
  );

  // Permanent status bar entry — only when the release-panel views actually
  // registered. Skipped on the update-before-reload activation, since clicking
  // it focuses those (not-yet-registered) views. Shown to Pro users too: it is
  // opt-in by definition, so it stays available to everyone.
  if (releaseVersion && !releasePanelRegistrationWentWrong) {
    context.subscriptions.push(
      createReleasePanelStatusBarItem(releaseVersion, isCampaignLive()),
    );
  }

  // Determine whether the release badge panel should be shown this session
  // (purely local — no network round-trip; see shouldShowReleasePanel).
  //
  // Pro users are excluded from the AUTOMATIC reveal only. The panel's content
  // sells Turbo Pro, and pushing it at someone who already bought would replace
  // their Pro views (`when: isPro && !isNewRelease`) with an upsell they have
  // already acted on. They keep the status bar entry above and can open the
  // panel whenever they want — it is just never forced on them.
  const showRelease =
    releaseVersion && !isProUser
      ? await shouldShowReleasePanel(context, releaseVersion)
      : false;
  if (
    showRelease &&
    releaseLauncherView &&
    !releasePanelRegistrationWentWrong
  ) {
    activateReleaseLauncherMode(context, releaseLauncherView);
  }

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

  // Count initial workspace logs (with error handling)
  // Wait for completion before making panel accessible to avoid empty state
  // v3.21.2: No longer shows workspace scanning notifications
  try {
    await initialWorkspaceLogsCount(extensionProperties, launcherView, context);
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

export function deactivate(): void {
  // Tear down resources held by the Pro bundle (the pre-commit IPC server).
  // No-op when no Pro bundle was run.
  disposeProBundle();
}
