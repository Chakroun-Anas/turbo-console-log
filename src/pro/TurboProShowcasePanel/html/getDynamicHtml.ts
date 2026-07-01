import { DynamicFreemiumPanel } from '../types';
import { contentByType } from '../contentByType';
import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';

/**
 * Generate dynamic HTML when dynamic content is available
 * @param dynamicContent The dynamic content to render
 * @returns Complete HTML string for dynamic content
 */
export function getDynamicHtml(
  dynamicContent: DynamicFreemiumPanel,
  variant?: string,
  options?: { dismissible?: boolean },
): string {
  // Separate content by type for different placement
  const { topContentHtml, articlesHtml } = contentByType(dynamicContent);

  // Opt-in bypass affordance — only the release panel passes `dismissible`, so
  // it never leaks into the shared freemium panel. Calls dismiss() (see
  // getJavaScript) which posts { command: 'dismiss' } to flip isNewRelease off.
  const dismissBarHtml = options?.dismissible
    ? `
        <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
          <button onclick="dismiss()" title="Return to Turbo Console Log" style="padding:6px 12px; background:transparent; color:var(--vscode-foreground); border:1px solid var(--vscode-panel-border); border-radius:4px; cursor:pointer; font-family:var(--vscode-font-family); font-size:12px; opacity:0.85;">✕ Bypass</button>
        </div>`
    : '';

  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        ${getCommonStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        ${dismissBarHtml}
        <!-- All Content in Order (except articles) -->
        ${topContentHtml}

        <!-- Articles Section -->
        ${
          articlesHtml
            ? `
        <section class="section">
          <h3>📚 Featured Turbo Articles</h3>
          <div class="articles-grid">
            ${articlesHtml}
          </div>
        </section>
        `
            : ''
        }
        
        <!-- Footer -->
        <footer class="footer">
          © 2026 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>

      <script>
        ${variant ? `const PANEL_VARIANT = '${variant}';` : ''}
        ${getJavaScript()}
      </script>
    </body>
  </html>
  `;
}
