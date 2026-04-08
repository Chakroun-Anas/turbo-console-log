import * as vscode from 'vscode';
import { getStaticHtml } from './html/getStaticHtml';

export class TurboProTrialGuidePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogProTrialGuide';

  constructor(private context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    // Get trial status to conditionally show CTA
    const trialStatus = this.context.globalState.get<
      'active' | 'expired' | undefined
    >('trial-status');
    const isTrialActive = trialStatus === 'active';

    // Check if user is a Pro user (has both license key and bundle)
    const proLicenseKey = this.context.globalState.get<string>('license-key');
    const proBundle = this.context.globalState.get<string>('pro-bundle');
    const isProUser = proLicenseKey !== undefined && proBundle !== undefined;

    // Hide CTA for trial users and Pro users
    return getStaticHtml(isTrialActive || isProUser);
  }
}
