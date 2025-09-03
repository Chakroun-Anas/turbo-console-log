import * as vscode from 'vscode';
import { readFromGlobalState } from './readFromGlobalState';

/**
 * Checks if the current user has an active Turbo Pro bundle
 * @param context VS Code extension context
 * @returns true if user has both license key and pro bundle
 */
export function isProUser(context: vscode.ExtensionContext): boolean {
  const proLicenseKey = readFromGlobalState<string>(context, 'license-key');
  const proBundle = readFromGlobalState<string>(context, 'pro-bundle');
  
  return !!(proLicenseKey && proBundle);
}
