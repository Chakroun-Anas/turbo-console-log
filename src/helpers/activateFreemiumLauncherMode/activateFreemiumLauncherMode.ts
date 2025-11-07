import * as vscode from 'vscode';
import { activateFreemiumMode } from '../activeFreemiumMode';
import { TurboFreemiumLauncherPanel } from '../../pro/TurboFreemiumLauncherPanel';
import { manageDynamicFreemiumPanel } from './launcherContent';
import { writeToGlobalState } from '../writeToGlobalState';
import { GlobalStateKeys } from '../GlobalStateKeys';
import { createTelemetryService } from '../../telemetry/telemetryService';
import { trackPanelOpenings } from '../trackPanelOpenings';

export function activateFreemiumLauncherMode(
  context: vscode.ExtensionContext,
  freemiumLauncherProvider: TurboFreemiumLauncherPanel,
): void {
  // Create tree view to get badge functionality
  const launcherView = vscode.window.createTreeView(
    TurboFreemiumLauncherPanel.viewType,
    {
      treeDataProvider: freemiumLauncherProvider,
    },
  );

  // Initialize badge with 0 and manage dynamic content if setting is enabled
  launcherView.badge = { value: 0, tooltip: 'New content in Turbo panel' };
  manageDynamicFreemiumPanel(context, launcherView);

  const launcherVisibilityDisposable = launcherView.onDidChangeVisibility(
    async (e: vscode.TreeViewVisibilityChangeEvent) => {
      if (!e.visible) return;

      // Report freemium panel opening event for analytics
      const telemetryService = createTelemetryService();
      telemetryService.reportFreemiumPanelOpening();

      // Track panel openings for notification triggers
      trackPanelOpenings(context);

      // remove the badge (user has "seen" it)
      if (launcherView) {
        launcherView.badge = undefined;
      }

      // Store the current time as the last panel access date
      // This prevents showing the badge again for the same content
      writeToGlobalState(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
        new Date().toISOString(),
      );

      activateFreemiumMode();
    },
  );

  context.subscriptions.push(launcherVisibilityDisposable);
  vscode.commands.executeCommand('setContext', 'turboConsoleLog:isPro', false);
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isRepairMode',
    false,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isLauncherMode',
    true,
  );
  vscode.commands.executeCommand(
    'setContext',
    'turboConsoleLog:isInitialized',
    true,
  );
}
