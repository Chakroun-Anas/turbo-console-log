import * as vscode from 'vscode';
import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';
import { getDynamicHtml } from './html/getDynamicHtml';
import { getStaticHtml } from './html/getStaticHtml';
import { GlobalStateKeys } from '../../helpers/GlobalStateKeys';
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
    // Load dynamic content from global storage
    const dynamicContent = this.context.globalState.get<DynamicFreemiumPanel>(
      GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
    );

    // Get the workspace log count directly from the launcher badge
    const logCount =
      typeof this.launcherView?.badge?.value === 'number'
        ? this.launcherView.badge.value
        : 0;

    // Clear separation: return dynamic version if content exists, otherwise static version
    if (
      dynamicContent &&
      dynamicContent.content &&
      dynamicContent.content.length > 0
    ) {
      // Create workspace log count component with color-coded count
      const workspaceLogCount: DynamicFreemiumPanelContent = {
        type: 'workspace-log-count',
        order: 0,
        component: {
          logCount: logCount,
          title: '📊 Your Workspace Log Count',
          description:
            'Turbo Pro navigates and manages them all in real-time as you code.',
        },
      };

      // Create Turbo Pro illustration showcase with CTA
      const turboProShowcase: DynamicFreemiumPanelContent = {
        type: 'media-showcase-cta',
        order: 1,
        component: {
          illustrationSrcs: [
            'https://www.turboconsolelog.io/assets/turbo-pro-illustration.png',
          ],
          cta: {
            text: 'Upgrade to Turbo PRO →',
            url: 'https://www.turboconsolelog.io/pro?utm_source=panel&utm_campaign=workspace_log_count&utm_medium=dynamic_panel',
          },
        },
      };

      // Inject workspace log count and Pro showcase at the beginning of content
      const contentWithBadge: DynamicFreemiumPanelContent[] = [
        workspaceLogCount,
        turboProShowcase,
        ...dynamicContent.content,
      ];

      return getDynamicHtml({
        ...dynamicContent,
        content: contentWithBadge,
      });
    } else {
      return getStaticHtml(logCount);
    }
  }
}
