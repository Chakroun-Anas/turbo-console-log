import { ExtensionProperties } from '../../entities';

import * as vscode from 'vscode';

export async function updateExtensionProperty(
  extensionProperty: keyof ExtensionProperties,
  newValue: ExtensionProperties[keyof ExtensionProperties],
): Promise<void> {
  await vscode.workspace
    .getConfiguration()
    .update(
      `turboConsoleLog.${extensionProperty}`,
      newValue,
      vscode.ConfigurationTarget.Global,
    );
}
