import * as vscode from 'vscode';
import { writeToGlobalState } from '../../helpers';

export function writeProBundleToCache(
  context: vscode.ExtensionContext,
  licenseKey: string,
  proBundle: string,
  version: string,
): void {
  writeToGlobalState(context, 'license-key', licenseKey);
  writeToGlobalState(context, 'pro-bundle', proBundle);
  writeToGlobalState(context, 'version', version);
}
