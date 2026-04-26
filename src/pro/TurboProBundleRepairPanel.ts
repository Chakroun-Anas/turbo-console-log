import * as vscode from 'vscode';

export class TurboProBundleRepairPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogBundleRepairPanel';
  private proBundleRemovalReason = '';
  private mode: 'run' | 'update';
  private webviewView?: vscode.WebviewView;

  constructor(proBundleRemovalReason: string, mode: 'run' | 'update') {
    this.proBundleRemovalReason = proBundleRemovalReason;
    this.mode = mode;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'retryUpdateProBundle') {
        if (this.webviewView) {
          this.webviewView.webview.html = this.getHtml(true);
        }
        vscode.commands.executeCommand('turboConsoleLog.retryProUpdate');
      } else if (message.command === 'retryRunProBundle') {
        if (this.webviewView) {
          this.webviewView.webview.html = this.getHtml(true);
        }
        vscode.commands.executeCommand('turboConsoleLog.retryProBundleRun');
      }
      // Unknown commands are ignored
    });

    webviewView.webview.html = this.getHtml(false);
  }

  updateView(mode: 'run' | 'update', proBundleRemovalReason: string) {
    this.mode = mode;
    this.proBundleRemovalReason = proBundleRemovalReason;
    if (this.webviewView) {
      this.webviewView.webview.html = this.getHtml(false);
    }
  }

  private repairShownMessage(): string {
    if (this.mode === 'update') {
      return this.proBundleRemovalReason !== ''
        ? `Turbo Console Log failed to update your previous pro bundle for the following reason: <span class='secondary-color'>${this.proBundleRemovalReason}</span>`
        : 'Turbo Console Log failed to update your previous pro bundle.';
    }
    return this.proBundleRemovalReason !== ''
      ? `Turbo Console Log failed to run your pro bundle for the following reason: <span class='secondary-color'>${this.proBundleRemovalReason}</span>`
      : 'Turbo Console Log failed to run your pro bundle.';
  }

  private retryButtonText(loading: boolean): string {
    if (loading) {
      return 'Retrying...';
    }
    if (this.mode === 'update') {
      return 'Retry Update';
    }
    return 'Retry Run';
  }

  private repairPostMessage(): string {
    if (this.mode === 'update') {
      return 'retryUpdateProBundle';
    }
    return 'retryRunProBundle';
  }

  private getHtml(loading: boolean): string {
    return `
      <html>
        <style>
          .primary-color {
            color: #FF6B6B;
          }
          .secondary-color {
            color: #FFC947;
          }
          .button {
            display: inline-block;
            padding: 14px 22px;
            width: 80%;
            background-color: #FF6B6B;
            color: white;
            border-radius: 6px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            max-width: 320px;
          }
        </style>
        <body style="padding-top: 0; display: flex; flex-direction: column; align-items: center; overflow-x: hidden;">
          <h1 class="primary-color" style="text-align: center; margin-bottom: 0;">Turbo Pro Repair Panel 🚀</h1>
          <h2 class="secondary-color" style="text-align: center;">No Panick We Will Repair This Together ✨</h2>
          <p style="text-align: center; padding: 0 16px;">
            ${this.repairShownMessage()}
          </p>

          <button class="button" id="retry-button" style="margin-top: 1.5rem;" ${loading ? 'disabled' : ''}>
            ${this.retryButtonText(loading)}
          </button>

          <p style="margin-top: 1rem; text-align: center; font-size: 13px;">
            If the issue persists, please contact us at
            <a href="mailto:support@turboconsolelog.io">support@turboconsolelog.io</a>
          </p>

          <script>
            const vscode = acquireVsCodeApi();
            const retryBtn = document.getElementById('retry-button');
            if (retryBtn) {
              retryBtn.addEventListener('click', () => {
                vscode.postMessage({ command: '${this.repairPostMessage()}' });
              });
            }
          </script>
        </body>
      </html>
    `;
  }
}
