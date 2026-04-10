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
  TurboProTrialGuidePanel,
  TrialCountdownTimer,
  TrialStatus,
  createTrialInvitationStatusBar,
  createTrialExpiredStatusBar,
} from './pro';
import { releaseNotes } from './releases';
import {
  proBundleNeedsUpdate,
  runProBundle,
  updateProBundle,
  fetchTrialBundle,
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

  const turboProTrialGuidePanel = new TurboProTrialGuidePanel(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TurboProTrialGuidePanel.viewType,
      turboProTrialGuidePanel,
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
      await runProBundle(extensionProperties, proBundle, context, version);
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

  // Handle Trial user logic (auto-activation on restart)
  const trialKey = readFromGlobalState<string>(context, 'trial-key');
  const trialExpiresAtISO = readFromGlobalState<string>(
    context,
    'trial-expires-at',
  );

  if (trialKey && trialExpiresAtISO) {
    const expiresAt = new Date(trialExpiresAtISO);
    const now = new Date();

    // Check if trial has expired locally
    if (now >= expiresAt) {
      // Trial expired - clean up metadata, show expired status bar
      console.log('[Trial] Trial has expired locally, cleaning up metadata');
      writeToGlobalState(context, 'trial-key', undefined);
      writeToGlobalState(context, 'trial-expires-at', undefined);
      writeToGlobalState(context, 'trial-status', 'expired');

      // Show expired status bar
      const statusBar = createTrialExpiredStatusBar();
      statusBar.show();
      context.subscriptions.push(statusBar);

      vscode.window.showInformationMessage(
        '⏰ Your trial has expired. Visit turboconsolelog.io/pro to upgrade!',
      );
    } else {
      // Trial still valid locally - attempt to reactivate
      console.log('[Trial] Auto-activating trial on restart');

      // Step 1: Fetch trial bundle (with dedicated error handling)
      let bundle: string;
      let serverExpiresAt: Date;

      try {
        // Fetch trial bundle again (server validates expiration + machine ID)
        const result = await fetchTrialBundle(trialKey, version);
        bundle = result.bundle;
        serverExpiresAt = result.expiresAt;

        // Validate server-returned expiration date
        const nowAfterFetch = new Date();
        if (nowAfterFetch >= serverExpiresAt) {
          // Server returned expired date - shouldn't happen, but handle it
          console.error(
            '[Trial] Server returned expired trial date:',
            serverExpiresAt,
          );
          writeToGlobalState(context, 'trial-key', undefined);
          writeToGlobalState(context, 'trial-expires-at', undefined);
          vscode.window.showErrorMessage(
            '❌ Trial has expired. Please request a new trial or upgrade to Pro.',
          );
          return;
        }
      } catch (error) {
        console.error('[Trial] Failed to fetch trial bundle:', error);

        // Axios throws for any non-2xx status AND for network errors
        const axiosError = error as {
          response?: { data?: { error?: string }; status?: number };
        };

        if (axiosError.response) {
          // Server responded with an error status
          const serverErrorMsg = axiosError.response.data?.error;
          const statusCode = axiosError.response.status;

          console.log(
            `[Trial] Server responded with status ${statusCode}: ${serverErrorMsg}`,
          );

          if (statusCode === 403) {
            // ForbiddenError: Trial not found, expired, or machine conflict
            // These are permanent trial issues - wipe metadata
            writeToGlobalState(context, 'trial-key', undefined);
            writeToGlobalState(context, 'trial-expires-at', undefined);

            vscode.window.showErrorMessage(
              serverErrorMsg
                ? `❌ ${serverErrorMsg}`
                : '❌ Trial validation failed. Please request a new trial or upgrade to Pro.',
            );
          } else {
            // 500 InternalError or other server errors
            // Server/processing issues - keep metadata and use repair mode
            console.log(
              '[Trial] Server error - activating repair mode for fetch',
            );
            activateRepairMode({
              context,
              version,
              config: extensionProperties,
              turboProBundleRepairPanel,
              reason:
                serverErrorMsg ?? 'Server error: Unable to validate trial',
              mode: 'trial-fetch',
              trialKey,
            });
            return;
          }
        } else {
          // Network error (no response from server) - activate repair mode
          console.log(
            '[Trial] Network error - activating repair mode for fetch',
          );
          activateRepairMode({
            context,
            version,
            config: extensionProperties,
            turboProBundleRepairPanel,
            reason:
              (error as { code?: string })?.code ??
              'Network error: Unable to reach server',
            mode: 'trial-fetch',
            trialKey,
          });
          return;
        }
        return;
      }

      // Step 2: Run trial bundle (with dedicated error handling)
      try {
        // Clear freemium launcher badge before activating Pro
        launcherView.badge = undefined;

        // Run bundle in memory (ephemeral - never cached)
        await runProBundle(extensionProperties, bundle, context);

        // Update expiration time
        writeToGlobalState(
          context,
          'trial-expires-at',
          serverExpiresAt.toISOString(),
        );

        // Start countdown timer
        const onExpired = async () => {
          // Clear trial metadata
          console.log('[Trial] Cleaning up expired trial metadata');
          writeToGlobalState(context, 'trial-key', undefined);
          writeToGlobalState(context, 'trial-expires-at', undefined);
          writeToGlobalState(context, 'trial-status', 'expired');

          // Deactivate Pro mode
          vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isPro',
            false,
          );

          // Initialize workspace logs and activate freemium launcher
          try {
            await initialWorkspaceLogsCount(
              extensionProperties,
              launcherView,
              context,
              version,
            );
          } catch (error) {
            console.error(
              '[Trial] Failed to initialize workspace log count on expiration:',
              error,
            );
          }
          // Reactivate freemium launcher mode
          activateFreemiumLauncherMode(context, launcherView);

          // Show expired status bar
          const expiredStatusBar = createTrialExpiredStatusBar();
          expiredStatusBar.show();
          context.subscriptions.push(expiredStatusBar);
        };

        const timer = new TrialCountdownTimer(
          serverExpiresAt,
          context,
          version,
          onExpired,
        );
        timer.start();
        context.subscriptions.push(timer);

        // Mark trial as active
        writeToGlobalState(context, 'trial-status', 'active');

        console.log('[Trial] Trial successfully auto-activated');

        // Reveal the Pro Guide panel to help users explore features
        try {
          await vscode.commands.executeCommand(
            'turboConsoleLogProTrialGuide.focus',
          );
        } catch {
          // Silently ignore if panel focus fails - not critical
        }

        return;
      } catch (error) {
        console.error('[Trial] Failed to run trial bundle:', error);

        // Bundle execution failed - activate repair mode
        activateRepairMode({
          context,
          version,
          config: extensionProperties,
          turboProBundleRepairPanel,
          reason: (error as { message?: string })?.message ?? '',
          mode: 'trial-run',
          trialBundle: bundle,
        });
        return;
      }
    }
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

    // Show trial status bar for non-Pro users
    const trialStatus = readFromGlobalState<TrialStatus>(
      context,
      'trial-status',
    );

    if (trialStatus === 'expired') {
      // Show expired trial status bar
      const statusBar = createTrialExpiredStatusBar();
      statusBar.show();
      context.subscriptions.push(statusBar);
    } else if (!trialStatus) {
      // Never tried - show invitation
      const statusBar = createTrialInvitationStatusBar();
      statusBar.show();
      context.subscriptions.push(statusBar);
    }
  }
}
