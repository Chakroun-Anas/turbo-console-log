import * as vscode from 'vscode';
import { AxiosError } from 'axios';
import { showNotification } from '../../ui';
import { fetchProBundle } from './fetchProBundle';
import { runProBundle } from './runProBundle';
import { writeProBundleToCache } from './writeProBundleToCache';
import { isOnline } from './isOnline';
import { ExtensionProperties } from '../../entities';

export async function updateProBundle(
  context: vscode.ExtensionContext,
  proVersion: string,
  licenseKey: string,
  extensionProperties: ExtensionProperties,
) {
  const isUserConnectedToInternet = await isOnline();

  if (!isUserConnectedToInternet) {
    await vscode.window.showErrorMessage(
      '📡 No internet connection. Please connect and try again.',
    );
    return;
  }
  try {
    const proBundle = await fetchProBundle(licenseKey, proVersion);
    writeProBundleToCache(context, licenseKey, proBundle, proVersion);
    runProBundle(extensionProperties, proBundle);
    showNotification(
      `Pro Bundle Updated Successfully v${proVersion} 🚀 🎉`,
      10000,
    );
  } catch (error) {
    console.error('Turbo Pro activation failed: ', error);
    const genericErrorMsg =
      'Something went wrong, please contact the support at support@turboconsolelog.io';
    if (error instanceof AxiosError) {
      const errorMsg = error.response?.data?.error;
      vscode.window.showErrorMessage(errorMsg ?? genericErrorMsg);
      return;
    }
    showNotification(
      'Something went wrong, please contact the support at support@turboconsolelog.io',
      5000,
    );
  }
}
