import * as vscode from 'vscode';

export class TurboProShowcasePanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboConsoleLogFreemiumPanel';

  constructor() {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'openUrl':
          vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
      }
    });

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #1e1e1e;
          color: #ffffff;
          line-height: 1.6;
        }

        h1, h2, h3 { font-weight: bold; margin: 0; }
        a { color: #48BFE3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .primary-color { color: #FF6B6B; }
        .secondary-color { color: #FFC947; }
        .info-color { color: #48BFE3; font-weight: bold; }
        .container { max-width: 800px; margin: 0 auto; padding: 16px; }

        /* Section Styles */
        .section {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          border: 1px solid rgba(72, 191, 227, 0.2);
        }
        .section h3 {
          color: #FFC947;
          font-size: 16px;
          margin-bottom: 12px;
          text-align: center;
        }

        /* Commands Table */
        .commands-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        .commands-table th,
        .commands-table td {
          padding: 8px 6px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
        }
        .commands-table th {
          background: rgba(255, 201, 71, 0.1);
          color: #FFC947;
          font-weight: bold;
        }
        .commands-table td:first-child {
          color: #48BFE3;
          font-weight: bold;
        }
        .commands-table td:last-child {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          font-size: 10px;
        }

        /* Articles Grid */
        .articles-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .article-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(72, 191, 227, 0.3);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .article-card:hover {
          border-color: #48BFE3;
          background: rgba(72, 191, 227, 0.08);
        }
        .article-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .article-title {
          color: #FFC947;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .article-desc {
          font-size: 11px;
          color: #CCCCCC;
          line-height: 1.4;
        }

        /* Survey Section */
        .survey-section {
          background: linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,201,71,0.12));
          border: 2px solid #FF6B6B;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          text-align: center;
        }
        .survey-section h3 {
          color: #FF6B6B;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .survey-section p {
          font-size: 12px;
          color: #FFFFFF;
          margin-bottom: 12px;
        }
        .survey-cta {
          display: inline-block;
          padding: 10px 16px;
          background: linear-gradient(135deg, #FF6B6B, #FFC947);
          color: #1E1E1E;
          color: #1E1E1E;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        .survey-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
        }

        .footer {
          text-align: center;
          margin-top: 16px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          color: #CCCCCC;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Survey Invitation Section -->
        <section class="survey-section">
          <h3>🚀 Shape Turbo's Future</h3>
          <p>
            Help us decide what's next for Turbo Console Log by taking our one-minute community survey.
          </p>
          <a
            href="https://www.turboconsolelog.io/community-survey"
            class="survey-cta"
            target="_blank"
            rel="noopener"
          >
            📝 Take Survey
          </a>
        </section>
         <!-- Commands Table Section -->
        <section class="section">
          <h3>⚡ Turbo Console Log Commands</h3>
          <table class="commands-table">
            <thead>
              <tr>
                <th>Command</th>
                <th>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Console Log</td>
                <td>⌘K ⌘L</td>
              </tr>
              <tr>
                <td>Console Info</td>
                <td>⌘K ⌘N</td>
              </tr>
              <tr>
                <td>Console Debug</td>
                <td>⌘K ⌘B</td>
              </tr>
              <tr>
                <td>Console Warn</td>
                <td>⌘K ⌘R</td>
              </tr>
              <tr>
                <td>Console Error</td>
                <td>⌘K ⌘E</td>
              </tr>
              <tr>
                <td>Console Table</td>
                <td>⌘K ⌘T</td>
              </tr>
              <tr>
                <td>Custom Log</td>
                <td>⌘K ⌘C</td>
              </tr>
              <tr>
                <td>Comment Logs</td>
                <td>⌥⇧C</td>
              </tr>
              <tr>
                <td>Uncomment Logs</td>
                <td>⌥⇧U</td>
              </tr>
              <tr>
                <td>Delete Logs</td>
                <td>⌥⇧D</td>
              </tr>
              <tr>
                <td>Correct Logs</td>
                <td>⌥⇧X</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Featured Articles Section -->
        <section class="section">
          <h3>📚 Featured Turbo Articles</h3>
          <div class="articles-grid">
            <div class="article-card" onclick="openUrl('https://www.turboconsolelog.io/articles/debugging-science-art')">
              <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdebugging-science-art.5d5dddf5.png&w=640&q=75" alt="Debugging Science Art" class="article-image" />
              <div class="article-title">Debugging: Between Science & Art</div>
              <div class="article-desc">Master the art and science of debugging with advanced techniques and methodologies.</div>
            </div>
            <div class="article-card" onclick="openUrl('https://www.turboconsolelog.io/articles/turbo-full-ast-engine')">
              <img src="https://www.turboconsolelog.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturbo-full-ast-engine.6f0df9f8.png&w=640&q=75" alt="Turbo Full AST Engine" class="article-image" />
              <div class="article-title">Understanding the Full AST Engine</div>
              <div class="article-desc">Deep dive into how Turbo's AST engine revolutionizes code analysis and log placement.</div>
            </div>
          </div>
        </section>
      </div>
        <!-- Footer -->
                <!-- Footer -->
        <footer class="footer">
          © 2025 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        
        function openUrl(url) {
          vscode.postMessage({
            command: 'openUrl',
            url: url
          });
        }
      </script>
    </body>
    </body>
  </html>
  `;
  }
}
