import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { readFromGlobalState } from './helpers';
import { TurboProFreemiumTreeProvider } from './pro';
import {
  runProBundle,
  updateProBundle,
  proBundleNeedsUpdate,
} from './commands/activateTurboProBundle';
import { showReleaseHtmlWebViewAndNotification } from './ui/helpers';
import { releaseNotes } from './releases';

const previousWebViewReleaseVersion = '2.16.0';
const latestWebViewReleaseVersion = '3.0.0';

export function activate(context: vscode.ExtensionContext): void {
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
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(context, 'pro-bundle');
  const proBundleVersion = readFromGlobalState<string>(context, 'version');
  showReleaseHtmlWebViewAndNotification(
    context,
    previousWebViewReleaseVersion,
    latestWebViewReleaseVersion,
  );
  if (proLicenseKey && proBundle) {
    if (
      releaseNotes[version]?.isPro &&
      proBundleNeedsUpdate(version, proBundleVersion)
    ) {
      updateProBundle(context, version, proLicenseKey, extensionProperties);
      return;
    }
    runProBundle(extensionProperties, proBundle);
    return;
  }
  const freemiumProvider = new TurboProFreemiumTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'turboConsoleLogProView',
      freemiumProvider,
    ),
  );
}

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    wrapLogMessage: workspaceConfig.wrapLogMessage ?? false,
    logMessagePrefix: workspaceConfig.logMessagePrefix ?? '🚀',
    logMessageSuffix: workspaceConfig.logMessageSuffix ?? ':',
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd ?? false,
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    logCorrectionNotificationEnabled:
      workspaceConfig.logCorrectionNotificationEnabled ?? false,
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeLineNum: workspaceConfig.includeLineNum ?? false,
    includeFilename: workspaceConfig.includeFilename ?? false,
    logType: workspaceConfig.logType ?? 'log',
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}
