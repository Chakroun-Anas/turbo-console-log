import * as vscode from 'vscode';
import axios from 'axios';
import { getDynamicHtml } from './TurboProShowcasePanel/html/getDynamicHtml';
import { DynamicFreemiumPanel } from './TurboProShowcasePanel/types';
import { createTelemetryService } from '../telemetry/telemetryService';
import { writeToGlobalState } from '../helpers/writeToGlobalState';
import { GlobalStateKey } from '@/entities';
import { isTestMode } from '@/runTime';
import { RELEASE_PANEL_FALLBACK_CONTENT } from './releasePanelFallbackContent';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

export class TurboReleasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogReleasePanel';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly version: string,
  ) {}

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    webviewView.webview.options = { enableScripts: true };

    webviewView.webview.html = this.getLoadingHtml(this.version);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'openUrl':
          vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
        case 'trackCtaClick': {
          const telemetryService = createTelemetryService();
          telemetryService.reportReleasePanelCtaClick(
            message.ctaUrl,
            message.variant,
            this.version,
          );
          break;
        }
        case 'dismiss':
          // Bypass the release panel — reveal the normal Turbo views again.
          // No guard write needed: resolveWebviewView already attempted it, so
          // healthy stores are set and broken stores would fail identically.
          await vscode.commands.executeCommand(
            'setContext',
            'turboConsoleLog:isNewRelease',
            false,
          );
          // isNewRelease=false re-satisfies the main container's `when` clauses;
          // bring that container forward so its content is revealed in place
          // instead of the now-empty release container collapsing.
          await vscode.commands.executeCommand(
            'workbench.view.extension.turboConsoleLogProPanelContainer',
          );
          break;
      }
    });

    // Unconditionally re-asserts the guard on every reveal — the local
    // self-heal path for a lost/missing guard now that the show-decision is
    // purely local (no server "already shown" check to fall back on).
    await writeToGlobalState(
      this.context,
      `${GlobalStateKey.HAS_SHOWN_RELEASE_PANEL}${this.version}`,
      true,
    );

    webviewView.onDidChangeVisibility(() => {
      if (!webviewView.visible) {
        vscode.commands.executeCommand(
          'setContext',
          'turboConsoleLog:isNewRelease',
          false,
        );
      }
    });

    try {
      const response = await axios.get<{
        variant: string;
        version: string;
        content: DynamicFreemiumPanel['content'];
        isDeactivated: boolean;
      }>(`${TURBO_WEBSITE_BASE_URL}/api/releasePanel`, {
        params: { version: this.version },
        timeout: 8000,
      });

      const { variant, content, isDeactivated } = response.data;

      if (isDeactivated || !content || content.length === 0) {
        webviewView.webview.html = this.getEmptyHtml();
        return;
      }

      const dynamicPanel: DynamicFreemiumPanel = {
        tooltip: `Turbo Console Log v${this.version} — What's New`,
        date: new Date().toISOString(),
        content,
      };

      webviewView.webview.html = getDynamicHtml(dynamicPanel, variant, {
        dismissible: true,
      });

      const telemetryService = createTelemetryService();
      telemetryService.reportReleasePanelShown(variant, this.version);
    } catch {
      const fallbackContent = RELEASE_PANEL_FALLBACK_CONTENT[this.version];
      if (fallbackContent) {
        const fallbackPanel: DynamicFreemiumPanel = {
          tooltip: `Turbo Console Log v${this.version} — What's New`,
          date: new Date().toISOString(),
          content: fallbackContent,
        };
        webviewView.webview.html = getDynamicHtml(fallbackPanel, 'fallback', {
          dismissible: true,
        });
        const telemetryService = createTelemetryService();
        telemetryService.reportReleasePanelShown('fallback', this.version);
      } else {
        webviewView.webview.html = this.getEmptyHtml();
      }
    }
  }

  private getLoadingHtml(version: string): string {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
            .loading { text-align: center; opacity: 0.7; }
          </style>
        </head>
        <body>
          <div class="loading">
            <p>Loading release v${version} notes…</p>
          </div>
        </body>
      </html>
    `;
  }

  private getEmptyHtml(): string {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
            .message { text-align: center; opacity: 0.6; }
            .dismiss { margin-top: 16px; padding: 6px 12px; background: transparent; color: var(--vscode-foreground); border: 1px solid var(--vscode-panel-border); border-radius: 4px; cursor: pointer; font-family: var(--vscode-font-family); font-size: 12px; opacity: 0.85; }
          </style>
        </head>
        <body>
          <div class="message">
            <p>Release notes coming soon for v${this.version}.</p>
            <button class="dismiss" onclick="dismiss()" title="Return to Turbo Console Log">✕ Bypass</button>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            function dismiss() {
              vscode.postMessage({ command: 'dismiss' });
            }
          </script>
        </body>
      </html>
    `;
  }
}
