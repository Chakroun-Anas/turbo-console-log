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
  const errorMsg =
    'Something went wrong while updating your Pro bundle, please check the Turbo Pro panel for more context and a chance to retry!';

  if (!isUserConnectedToInternet) {
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(
      '📡 No internet connection. Please connect and try again from the panel!',
    );
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
    console.error('Turbo Pro update failed: ', error);
    let errorMsg =
      (error as { message?: string })?.message ?? 'Something went wrong!';
    if (error instanceof AxiosError) {
      errorMsg = error.response?.data?.error;
    }
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(errorMsg);
  }
}
