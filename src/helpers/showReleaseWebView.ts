import * as vscode from 'vscode';
import axios from 'axios';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { GlobalStateKey } from '@/entities';
import { createTelemetryService } from '../telemetry/telemetryService';
import { WebviewVariantResponse } from '@/entities/WebviewVariant';
import { WEBVIEW_FALLBACK_VARIANTS } from '../releases/3120';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Shows v3.12.0 release webview announcing new Turbo Pro shape using Thompson Sampling
 * Only shows once using global state tracking
 * Tracks shown/clicked events for A/B testing
 * Note: Caller should ensure this is only called for non-Pro users
 * @param context VS Code extension context
 */
export async function showReleaseWebView(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Check if webview has already been shown
  const version = '3.12.0';
  const stateKey = `${GlobalStateKey.HAS_SHOWN_RELEASE_WEBVIEW}${version}`;
  const hasShownWebView = readFromGlobalState<boolean>(context, stateKey);

  if (hasShownWebView) return;

  const telemetryService = createTelemetryService();

  try {
    const variantData = await fetchWebviewVariant(version);
    const variant = variantData.variant;
    const title = variantData.title;
    const htmlContent = variantData.htmlContent;

    // Track that webview was shown (fire-and-forget with error handling)
    telemetryService
      .reportWebviewInteraction(version, variant, 'shown')
      .catch((err) =>
        console.warn('Failed to report webview shown event:', err),
      );

    // Create webview panel
    const panel = vscode.window.createWebviewPanel(
      'turboReleaseWebview',
      title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
      },
    );

    panel.webview.html = htmlContent;

    // Listen for link clicks (CTA button)
    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === 'openExternal') {
          // Track click event (fire-and-forget with error handling)
          telemetryService
            .reportWebviewInteraction(version, variant, 'clicked')
            .catch((err) =>
              console.warn('Failed to report webview click event:', err),
            );

          // Open URL in external browser
          await vscode.env.openExternal(vscode.Uri.parse(message.url));
        }
      },
      undefined,
      context.subscriptions,
    );
  } catch (error) {
    console.error('Failed to show release webview:', error);

    // Fallback to variant C if Thompson Sampling fails
    const fallbackVariant = WEBVIEW_FALLBACK_VARIANTS['A'];
    const htmlContent = fallbackVariant.htmlContent;
    const title = fallbackVariant.title;
    const variant = 'fallback';

    // Track that fallback webview was shown (fire-and-forget with error handling)
    telemetryService
      .reportWebviewInteraction(version, variant, 'shown')
      .catch((err) =>
        console.warn('Failed to report fallback webview shown event:', err),
      );

    // Create webview panel for fallback
    const panel = vscode.window.createWebviewPanel(
      'turboReleaseWebview',
      title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
      },
    );

    panel.webview.html = htmlContent;

    // Listen for link clicks (CTA button) in fallback
    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === 'openExternal') {
          // Track click event (fire-and-forget with error handling)
          telemetryService
            .reportWebviewInteraction(version, variant, 'clicked')
            .catch((err) =>
              console.warn('Failed to report webview click event:', err),
            );

          // Open URL in external browser
          await vscode.env.openExternal(vscode.Uri.parse(message.url));
        }
      },
      undefined,
      context.subscriptions,
    );
  } finally {
    // Mark webview as shown even on error
    writeToGlobalState(context, stateKey, true);
  }
}

/**
 * Fetch webview variant from API using Thompson Sampling
 * Returns variant with title and htmlContent from server
 * Falls back to variant A on error
 */
async function fetchWebviewVariant(
  version: string,
): Promise<WebviewVariantResponse> {
  const url = `${TURBO_WEBSITE_BASE_URL}/api/webviewVariant?version=${version}`;

  const response = await axios.get<WebviewVariantResponse>(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
