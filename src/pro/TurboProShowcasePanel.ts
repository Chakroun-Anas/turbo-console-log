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
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }

        /* Hero Section */
        .hero-section {
          text-align: center;
          padding: 24px 16px;
          background: linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,201,71,0.08));
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 201, 71, 0.3);
        }
        .hero-title {
          font-size: 22px;
          color: #FF6B6B;
          margin-bottom: 8px;
        }
        .hero-subtitle {
          font-size: 16px;
          color: #FFC947;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .hero-description {
          font-size: 14px;
          color: #CCCCCC;
          margin: 0 auto;
        }

        /* Newsletter Section */
        .newsletter-hero {
          background: linear-gradient(135deg, rgba(72, 191, 227, 0.12), rgba(255, 107, 107, 0.12));
          border: 2px solid #48BFE3;
          border-radius: 12px;
          padding: 20px 16px;
          margin: 20px 0;
          text-align: center;
        }
        .newsletter-hero h2 {
          color: #48BFE3;
          font-size: 18px;
          margin-bottom: 12px;
        }
        .newsletter-hero p {
          font-size: 13px;
          color: #FFFFFF;
          margin-bottom: 16px;
          margin-left: auto;
          margin-right: auto;
        }
        .newsletter-illustration {
          margin: 0 auto 16px auto;
          max-width: 240px;
        }
        .newsletter-illustration img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(72, 191, 227, 0.25);
        }
        .newsletter-cta {
          display: inline-block;
          padding: 12px 20px;
          background: linear-gradient(135deg, #48BFE3, #9CE3F0);
          color: #1E1E1E;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(72, 191, 227, 0.3);
        }
        .newsletter-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 191, 227, 0.4);
        }
        .micro-reassure {
          margin-top: 6px;
          font-size: 11px;
          color: #B8E8F6;
        }
        .bonus-highlight {
          background: rgba(255, 201, 71, 0.2);
          border: 1px solid #FFC947;
          border-radius: 6px;
          padding: 8px;
          margin-top: 12px;
          font-size: 12px;
          color: #FFC947;
        }

        /* Features Section */
        .features-simple {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          border: 1px solid rgba(72, 191, 227, 0.2);
        }
        .features-simple h3 {
          color: #FFC947;
          font-size: 16px;
          margin-bottom: 12px;
          text-align: center;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 4px 0;
          color: #CCCCCC;
          display: flex;
          align-items: baseline;
          font-size: 12px;
        }
        .feature-list li::before {
          content: "⚡";
          margin-right: 8px;
          font-size: 14px;
        }
        .bullet-label {
          display: inline-block;
          margin-right: 4px;
          color: #FFFFFF;
        }

        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          color: #CCCCCC;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Hero -->
        <section class="hero-section">
          <h1 class="hero-title">📬 Be Part of Turbo's Future</h1>
          <p class="hero-description">
            Get early updates, exclusive debugging tips, and help shape what we build next.
          </p>
        </section>

        <!-- Newsletter -->
        <section class="newsletter-hero">
          <h2>Join Our Inner Circle</h2>
          <p>
            Be the first to know about new features, get exclusive strategies, and receive your instant Turbo Pro discount.
          </p>

          <div class="newsletter-illustration">
            <img src="https://www.turboconsolelog.io/assets/turbo-pro-tree.png" alt="Turbo Pro Tree preview" />
          </div>

          <a
            href="https://www.turboconsolelog.io/join?utm_source=webview_showcasepanel&utm_medium=app&utm_campaign=newsletter_innercircle&utm_content=main_cta"
            class="newsletter-cta"
            target="_blank"
            rel="noopener"
          >
            🎯 Join & Get Your Pro Discount
          </a>
          <div class="micro-reassure">No spam. Unsubscribe anytime.</div>

          <div class="bonus-highlight">
            🎁 Instant bonus: 30% off Turbo Pro + exclusive debugging strategies
          </div>
        </section>

        <!-- Features -->
        <section class="features-simple">
          <h3>⚡ What You'll Get with Turbo Pro</h3>
          <ul class="feature-list">
            <li>
              <strong class="bullet-label">Native TreeView Panel:</strong>
              color-coded logs with instant actions
            </li>
            <li>
              <strong class="bullet-label">Real-time Sync:</strong>
              workspace logs updated automatically
            </li>
            <li>
              <strong class="bullet-label">Smart Auto-correct:</strong>
              line numbers and file names stay accurate
            </li>
            <li>
              <strong class="bullet-label">Contextual Actions:</strong>
              file-level commands via right-click menu
            </li>
          </ul>
        </section>

        <!-- Footer -->
        <footer class="footer">
          © 2025 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>
    </body>
  </html>
  `;
  }
}
