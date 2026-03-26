import * as vscode from 'vscode';
import { writeToGlobalState } from '../writeToGlobalState';
import { GlobalStateKeys } from '../GlobalStateKeys';
import { createTelemetryService } from '../../telemetry/telemetryService';
import { trackPanelOpenings } from '../trackPanelOpenings';
import { activateFreemiumMode } from '../activeFreemiumMode';

export function activateFreemiumLauncherMode(
  context: vscode.ExtensionContext,
  launcherView: vscode.TreeView<string>,
): void {
  // Manage dynamic content if setting is enabled
  // manageDynamicFreemiumPanel(context);

  const launcherVisibilityDisposable = launcherView.onDidChangeVisibility(
    async (e: vscode.TreeViewVisibilityChangeEvent) => {
      if (!e.visible) return;

      // Report freemium panel opening event for analytics
      const telemetryService = createTelemetryService();
      telemetryService.reportFreemiumPanelOpening();

      // Track panel openings for notification triggers
      trackPanelOpenings(context);

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
