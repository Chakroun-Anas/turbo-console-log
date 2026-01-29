import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';
import { contentByType } from '../contentByType';
import { getStaticContent } from '../staticContent';
import { DynamicFreemiumPanelContent } from '../types';

/**
 * Generate static HTML using the same structure as dynamic content
 * @returns Complete HTML string for static content
 */
export function getStaticHtml(logCount: number): string {
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
  // Get static content that matches the dynamic structure
  const staticContent = getStaticContent();

  // Inject workspace log count and Pro showcase at the beginning of content
  const contentWithBadge: DynamicFreemiumPanelContent[] = [
    workspaceLogCount,
    turboProShowcase,
    ...staticContent.content,
  ];

  // Use the same content separation logic as dynamic version
  const { topContentHtml, articlesHtml } = contentByType({
    ...staticContent,
    content: contentWithBadge,
  });

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
          © 2025 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>

      <script>
        ${getJavaScript()}
      </script>
    </body>
  </html>
  `;
}
