import * as vscode from 'vscode';
import { getStaticHtml } from './html/getStaticHtml';
import { createTelemetryService } from '../../telemetry/telemetryService';
import { trackPanelOpenings } from '../../helpers/trackPanelOpenings';

export class TurboProShowcasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogFreemiumPanel';

  constructor(
    private context: vscode.ExtensionContext,
    private launcherView: vscode.TreeView<string>,
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Track freemium panel opening for analytics
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        const telemetryService = createTelemetryService();
        telemetryService.reportFreemiumPanelOpening();

        // Track panel openings for notification triggers
        trackPanelOpenings(this.context);
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
    // Get workspace log metadata from global state
    const metadata = this.context.globalState.get<{
      totalLogs: number;
      totalFiles: number;
      repositories: Array<{
        name: string;
        path: string;
        logCount: number;
        fileCount: number;
        topNestedFolder?: {
          relativePath: string;
          logCount: number;
          percentage: number;
        };
      }>;
      logTypeDistribution: Array<{
        type: string;
        count: number;
        percentage: number;
      }>;
    } | null>('WORKSPACE_LOG_METADATA');

    // Get the workspace log count directly from the launcher badge
    const logCount =
      typeof this.launcherView?.badge?.value === 'number'
        ? this.launcherView.badge.value
        : 0;

    // Get trial status to conditionally show trial CTA
    const trialStatus = this.context.globalState.get<
      'active' | 'expired' | undefined
    >('trial-status');

    // Pro-only panel: Always show workspace analytics, Pro features, and Pro illustration
    return getStaticHtml(logCount, metadata, trialStatus);
  }
}
