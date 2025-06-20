import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { readFromGlobalState, getExtensionProperties } from './helpers';
import { TurboProFreemiumTreeProvider } from './pro';
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
