import * as vscode from 'vscode';

export class TurboProShowcasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogFreemiumPanel';

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    return `
      <html>
        <style>
            .primary-color {
                color: #FF6B6B;
            }
            .secondary-color {
                color: #FFC947;
            }
            .illustration {
                display: block;
                margin: 0 auto 0px auto;
                max-width: 300px;
                width: 100%;
                border-radius: 8px;
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
            .list { padding-left: 20px; }
            .list li { margin-bottom: 8px; list-style-type:none; }
            .list li:last-child {margin-bottom: 0px;}
            .list li::before { content: "✅"; margin-right: 10px; }
        </style>
        <body style="padding-top: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow-x: hidden;">
            <h2 class="primary-color" style="text-align: center;">Turbo Pro Is Here 🚀</h2>
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <img
                    src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-pro-illustration.4cf37990.png&amp;w=640&amp;q=75"
                    alt="Turbo Pro Illustration"
                    class="illustration"
                />
                <p style="text-align: center;">Take your debugging to the next level with the Pro release!</p>
            </div>
            <div style="display: flex; justify-content: center;">
                <ul class="list">
                    <li>Native dedicated VSCode panel for the extension 🚀</li>
                    <li>Current folder/workspace logs listing via VSCode Tree View API 🌲</li>
                    <li>Real time synchronisation of the current folder/workspace logs in the tree ⚡️</li>
                    <li>Contextual menu to execute turbo command actions on the file level 🚦</li>
                    <li>Auto correct turbo log messages line numbers and file names when the tree is synchronised 🖊️</li>
                    <li>Blazing fast and 100% native to VSCode 🚀</li>
                </ul>
            </div>
            <a href="https://turboconsolelog.io/pro" target="_blank" style="text-decoration: none; outline: none; margin-top: 0rem;">
                <div style="display: flex; justify-content: center;">
                    <button class="button" onclick="openTurboProPage()">
                        GET LIFETIME LICENCE FOR 14.99€
                    </button>
                </div>
            </a>
            <p style="margin-top: 1rem; margin-bottom: 0px; text-align: center;">
                 Copyright &copy; 2025 Turbo Unicorn 🦄 - All Rights Reserved.
            </p>
            <script>
                const vscode = acquireVsCodeApi();
                function openTurboProPage() {
                    const vscode = acquireVsCodeApi();
                    window.open("https://www.turboconsolelog.io/pro", "_blank")
                }
            </script>
        </body>
      </html>
    `;
  }
}
