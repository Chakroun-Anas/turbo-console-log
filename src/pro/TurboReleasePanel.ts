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

    webviewView.webview.onDidReceiveMessage((message) => {
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
        }
      }
    });

    writeToGlobalState(
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

      webviewView.webview.html = getDynamicHtml(dynamicPanel, variant);

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
        webviewView.webview.html = getDynamicHtml(fallbackPanel, 'fallback');
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
          </style>
        </head>
        <body>
          <div class="message">
            <p>Release notes coming soon for v${this.version}.</p>
          </div>
        </body>
      </html>
    `;
  }
}
