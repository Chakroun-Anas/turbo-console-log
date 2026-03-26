import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';
import { contentByType } from '../contentByType';
import { DynamicFreemiumPanelContent } from '../types';

/**
 * Generate static HTML using the same structure as dynamic content
 * @returns Complete HTML string for static content
 */
export function getStaticHtml(
  logCount: number,
  metadata?: {
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
  } | null,
): string {
  // Determine if we should show analytics section
  // Skip when: metadata is null (error) OR logCount is 0 (no logs found)
  const showAnalytics = metadata !== null && logCount > 0;

  // Conditionally create workspace analytics component (only if we have data to show)
  const workspaceLogCount: DynamicFreemiumPanelContent | null = showAnalytics
    ? {
        type: 'workspace-log-count',
        order: 0,
        component: {
          logCount: logCount,
          title: 'Your Workspace Analytics',
          description: 'Real-time insights into your workspace logs.',
          metadata: metadata,
        },
      }
    : null;

  // Create Pro features reveal component (separate from analytics)
  // Adjust title and content based on whether analytics is shown
  const proFeaturesReveal: DynamicFreemiumPanelContent = {
    type: 'paragraph',
    order: showAnalytics ? 2 : 0,
    component: {
      title: showAnalytics
        ? 'What Turbo Pro Brings ✨'
        : '🚀 Turbo Pro Ultimate Logs Manager',
      rawHtml: true, // Render HTML for feature items
      content: `
        <div class="features-reveal-standalone">
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">🌲</div>
              <div class="feature-content">
                <div class="feature-name">Workspace Tree View</div>
                <div class="feature-desc">See all ${showAnalytics ? `${logCount} logs` : 'logs'} organized by file in one view</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔍</div>
              <div class="feature-content">
                <div class="feature-name">Instant Search</div>
                <div class="feature-desc">Find any log by content in seconds</div>
              </div>
            </div>
            <div class="feature-item feature-new">
              <div class="feature-icon">🎯</div>
              <div class="feature-content">
                <div class="feature-name">Git Filter<span class="new-badge">v3.19.0</span></div>
                <div class="feature-desc">Show ONLY logs in your changed files</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🧹</div>
              <div class="feature-content">
                <div class="feature-name">Bulk Cleanup</div>
                <div class="feature-desc">Delete all logs in one click</div>
              </div>
            </div>
          </div>
          
          <!-- Testimonial -->
          <div class="testimonial-section">
            <div class="testimonial-quote">"This is one of the best extensions I've installed in VS Code. Managing my console logs makes it so easy for me to make sure I don't leave logging unnecessarily active in my code."</div>
            <div class="testimonial-author">— Kristian Serrano</div>
          </div>
        </div>
      `,
    },
  };

  // Create first CTA after analytics (if shown)
  const firstCta: DynamicFreemiumPanelContent | null = showAnalytics
    ? {
        type: 'media-showcase-cta',
        order: 1,
        component: {
          illustrationSrcs: [
            'https://www.turboconsolelog.io/assets/turbo-pro-illustration.png',
          ],
          tagline: 'Stop hunting logs file by file',
          cta: {
            text: 'Take Back Control',
            url: 'https://www.turboconsolelog.io/pro?utm_source=panel&utm_campaign=workspace_log_count&utm_medium=dynamic_panel&position=after_analytics',
          },
        },
      }
    : null;

  // Create Turbo Pro illustration showcase with CTA (final)
  const turboProShowcase: DynamicFreemiumPanelContent = {
    type: 'media-showcase-cta',
    order: 3,
    component: {
      illustrationSrcs: [
        'https://www.turboconsolelog.io/assets/turbo-pro-illustration.png',
      ],
      tagline: 'Stop hunting logs file by file',
      cta: {
        text: 'Take Back Control',
        url: 'https://www.turboconsolelog.io/pro?utm_source=panel&utm_campaign=workspace_log_count&utm_medium=dynamic_panel&position=final',
      },
    },
  };
  // Pro-only content: Conditionally include workspace analytics (skip when error or zero logs)
  const proOnlyContent: DynamicFreemiumPanelContent[] = [
    ...(workspaceLogCount ? [workspaceLogCount] : []),
    ...(firstCta ? [firstCta] : []),
    proFeaturesReveal,
    turboProShowcase,
  ];

  // Use content separation logic for Pro components
  const { topContentHtml, articlesHtml } = contentByType({
    tooltip: 'Turbo Pro Showcase',
    date: new Date(),
    content: proOnlyContent,
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
          © 2026 Turbo Console Log • Built with ❤️ by Turbo Unicorn 🦄
        </footer>
      </div>

      <script>
        ${getJavaScript()}
      </script>
    </body>
  </html>
  `;
}
