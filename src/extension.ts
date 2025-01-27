import * as vscode from 'vscode';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';

const CURRENT_VERSION = '2.10.6';
const DONATION_LINK = 'https://turboconsolelog.io/home?showSponsor=true';
const LAST_VERSION_KEY = 'lastNotifiedVersion';

export function activate(context: vscode.ExtensionContext): void {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const properties: ExtensionProperties = getExtensionProperties(config);
  const commands: Array<Command> = getAllCommands();

  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler(properties, jsDebugMessage, args);
    });
  }

  checkVersionAndShowNotification(context);
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

// Function to check version and show notification
function checkVersionAndShowNotification(
  context: vscode.ExtensionContext,
): void {
  const installedVersion = vscode.extensions.getExtension(
    'chakrounanas.turbo-console-log',
  )?.packageJSON.version;

  if (
    installedVersion &&
    isVersionGreaterThan(installedVersion, CURRENT_VERSION)
  ) {
    const lastNotifiedVersion =
      context.globalState.get<string>(LAST_VERSION_KEY);

    // Show notification only if it's a new version
    if (lastNotifiedVersion !== installedVersion) {
      vscode.window
        .showInformationMessage(
          `Your support is critical to keep Turbo Console Log alive! Consider sponsoring the project.`,
          'Donate',
          'Dismiss',
        )
        .then((selection) => {
          if (selection === 'Donate') {
            vscode.env.openExternal(vscode.Uri.parse(DONATION_LINK));
          }
        });

      // Update the last notified version
      context.globalState.update(LAST_VERSION_KEY, installedVersion);
    }
  }
}

// Function to compare semantic versions
function isVersionGreaterThan(version: string, baseVersion: string): boolean {
  const parseVersion = (v: string) =>
    v.split('.').map((num) => parseInt(num, 10));
  const [majorA, minorA, patchA] = parseVersion(version);
  const [majorB, minorB, patchB] = parseVersion(baseVersion);

  if (majorA !== majorB) return majorA > majorB;
  if (minorA !== minorB) return minorA > minorB;
  return patchA > patchB;
}
