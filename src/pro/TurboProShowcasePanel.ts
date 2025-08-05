import * as vscode from 'vscode';

export class TurboProShowcasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogFreemiumPanel';

  constructor() {}

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
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: #1e1e1e;
        color: #ffffff;
      }

      .primary-color {
        color: #FF6B6B;
      }

      .illustration-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        margin-bottom: 6px;
      }

      .illustration {
        max-width: 300px;
        width: 100%;
        border-radius: 8px;
        cursor: pointer;
      }

      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 64px;
        height: 64px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .play-icon::before {
        content: '';
        display: block;
        width: 0;
        height: 0;
        border-left: 18px solid white;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        margin-left: 4px;
      }

      .caption {
        text-align: center;
        margin-top: 4px;
        font-size: 0.9rem;
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
        margin-bottom: 12px;
      }

      .newsletter-button {
        display: inline-block;
        padding: 14px 22px;
        width: 80%;
        background-color: #FFC947;
        color: black;
        border-radius: 6px;
        font-weight: bold;
        text-decoration: none;
        text-align: center;
        cursor: pointer;
        max-width: 320px;
        margin-bottom: 24px;
      }

      .discount-illustration {
        max-width: 250px;
        width: 100%;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .discount-text {
        background: linear-gradient(135deg, #FF6B6B, #FFC947);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        font-size: 1.1rem;
        text-align: center;
        margin: 12px 0;
      }

      .small-text {
        font-size: 0.8rem;
        color: #CCCCCC;
        text-align: center;
        margin-top: 8px;
      }

      .list {
        padding-left: 20px;
      }

      .list li {
        margin-bottom: 8px;
        list-style-type: none;
      }

      .list li::before {
        content: "✅";
        margin-right: 10px;
      }

      .footer {
        margin-top: 1rem;
        text-align: center;
      }
    </style>
    <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow-x: hidden;">
      <h1 class="primary-color" style="text-align: center;">Unlock Turbo Pro Bundle 🚀</h1>

      <div class="illustration-wrapper">
        <a href="https://www.turboconsolelog.io/pro" target="_blank" style="display: inline-block;">
          <img
            src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-pro-illustration.4cf37990.png&amp;w=640&amp;q=75"
            alt="Turbo Pro Illustration"
            class="illustration"
          />
          <div class="play-icon"></div>
        </a>
      </div>
      <ul class="list">
        <h2 class="primary-color">Features</h2>
        <li>Native dedicated VSCode panel for the extension 🚀</li>
        <li>Current folder/workspace logs listing via VSCode Tree View API 🌲</li>
        <li>Color-coded console methods for instant visual recognition 🎨</li>
        <li>Real time synchronisation of the current folder/workspace logs in the tree ⚡️</li>
        <li>Contextual menu to execute turbo command actions on the file level 🚦</li>
        <li>Auto correct turbo log messages line numbers and file names when the tree is synchronised 🖊️</li>
        <li>Blazing fast and 100% native to VSCode 💨</li>
      </ul>

      <div style="background: rgba(255,107,107,0.1); border: 2px solid #FF6B6B; border-radius: 8px; padding: 16px; margin: 16px 8px; text-align: center;">
        <h3 style="color: #FF6B6B; margin: 0 0 8px 0; font-size: 16px;">🎉 Celebrate v3.4.0 Release!</h3>
        <p style="margin: 0; font-size: 13px; color: #CCCCCC;">
          New keyboard shortcuts for all console methods
        </p>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 0.75rem;">
        <img
          src="https://www.turboconsolelog.io/assets/subscribe-30-off.png"
          alt="Subscribe for 30% Off"
          class="discount-illustration"
        />
      </div>

      <a href="https://turboconsolelog.io/join" target="_blank" style="text-decoration: none; outline: none;">
        <div style="display: flex; justify-content: center;">
          <button class="newsletter-button">
            📬 JOIN NEWSLETTER & GET 30% OFF NOW
          </button>
        </div>
      </a>

      <p class="footer">
        Copyright &copy; 2025 Turbo Unicorn 🦄 – All Rights Reserved.
      </p>
    </body>
  </html>
  `;
  }
}
