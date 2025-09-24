import * as vscode from 'vscode';
import { DynamicFreemiumPanel } from './types';
import { getDynamicHtml } from './html/getDynamicHtml';
import { getStaticHtml } from './html/getStaticHtml';
import { GlobalStateKeys } from '../../helpers/GlobalStateKeys';
import { createTelemetryService } from '../../telemetry/telemetryService';

export class TurboProShowcasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogFreemiumPanel';

  constructor(private context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Track freemium panel opening for analytics
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        const telemetryService = createTelemetryService();
        telemetryService.reportFreemiumPanelOpening();
      }
    });

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'openUrl':
          vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
        case 'trackCtaClick': {
          // Track CTA click for analytics
          const telemetryService = createTelemetryService();
          telemetryService.reportFreemiumPanelCtaClick(
            message.ctaType,
            message.ctaText,
            message.ctaUrl,
          );
          break;
        }
      }
    });

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    // Load dynamic content from global storage
    const dynamicContent = this.context.globalState.get<DynamicFreemiumPanel>(
      GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
    );

    // Clear separation: return dynamic version if content exists, otherwise static version
    if (
      dynamicContent &&
      dynamicContent.content &&
      dynamicContent.content.length > 0
    ) {
      return getDynamicHtml(dynamicContent);
    } else {
      return getStaticHtml();
    }
  }
}
