import { getCommonStyles } from '../styles/getCommonStyles';
import { getJavaScript } from '../javascript/javascript';
import { contentByType } from '../contentByType';
import { DynamicFreemiumPanelContent } from '../types';
import { isTestMode } from '@/runTime';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

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
  // Render the analytics charts only when the workspace actually has logs.
  const showAnalytics = metadata !== null && logCount > 0;

  // The full Pro feature set, surfaced as a locked/disabled board inside the
  // analytics card (this replaces the old standalone "What Turbo Pro Brings"
  // list). First two are the v3.25.0 cleanup story; the rest are log management.
  const lockedFeatures = [
    {
      icon: '🧹',
      name: 'Auto-Cleanup on Commit',
      desc: 'Keep debug logs like these out of every commit',
      isNew: true,
    },
    {
      icon: '👀',
      name: 'Live Cleanup Preview',
      desc: 'See exactly what will be removed before you commit',
      isNew: true,
    },
    {
      icon: '🎯',
      name: 'Git Filter',
      desc: 'Focus on the logs in your changed files',
    },
    {
      icon: '🌲',
      name: 'Workspace Tree View',
      desc: 'Manage every log across your files in one place',
    },
    {
      icon: '🔍',
      name: 'Instant Search',
      desc: 'Find any log by content in seconds',
    },
  ];

  const testimonial = {
    quote:
      "I just can't live without this extension. The setup is super easy and flexible and the shortcut makes it super handy. The Pro Plan is super worthy for someone who uses it on a daily basis, since it unblocks organizing features you'll find yourself wanting during development.",
    author: 'Caio Lemos',
  };

  // The analytics card ALWAYS renders: charts when there are logs, and always the
  // locked Pro board — so features show even for a fresh (zero-log) workspace.
  // Its "Unlock with Turbo Pro" header links straight to the Pro page.
  const workspaceLogCount: DynamicFreemiumPanelContent = {
    type: 'workspace-log-count',
    order: 0,
    component: {
      logCount: logCount,
      title: 'Your Workspace Analytics',
      description:
        'A snapshot of your workspace debug logs — the kind Turbo Pro clears from your commits.',
      metadata: showAnalytics ? metadata : null,
      lockedFeatures,
      unlockUrl: `${TURBO_WEBSITE_BASE_URL}/pro?utm_source=panel&utm_campaign=workspace_log_count&utm_medium=dynamic_panel&position=locked_board&event=freemiumPanel_auto-cleanup-launch&variant=panel-pro-unlock`,
    },
  };

  // Inline cleanup demo + CTA, with the testimonial rendered full-width below it
  // — the closing block, directly under the analytics + locked board.
  const turboProShowcase: DynamicFreemiumPanelContent = {
    type: 'media-showcase-cta',
    order: 1,
    component: {
      // No mascot — the inline cleanup demo below shows the feature instead.
      illustrationSrcs: [],
      codeDemo: {
        lines: [
          { text: 'function pay(cart) {' },
          { text: "  console.log('🚀 cart:', cart)", removed: true },
          { text: '  const total = sum(cart)' },
          { text: '  console.log(total)', removed: true },
          { text: '  return total' },
          { text: '}' },
        ],
        caption: "🧹 Turbo's and yours — removed on commit",
      },
      settingsDemo: {
        title: 'Log Cleanup config',
        items: [
          { label: 'Auto-cleanup on Commit', on: true },
          { label: 'console.log, console.error', on: true },
          { label: '🚀 Turbo Logs Only', on: false },
        ],
      },
      tagline: 'Never commit a debug log again',
      subtitle:
        'For devs who ship fast: linters and pre-commit hooks just flag stray logs and leave the cleanup to you. Turbo removes them — always previewed, scope under your control. Pay once, yours forever.',
      cta: {
        text: 'Turn On Auto-Cleanup',
        url: `${TURBO_WEBSITE_BASE_URL}/pro?utm_source=panel&utm_campaign=workspace_log_count&utm_medium=dynamic_panel&position=after_analytics&event=freemiumPanel_auto-cleanup-launch&variant=panel-pro-cta`,
      },
      testimonial,
    },
  };

  // Analytics card (with the locked Pro board) first; illustration + CTA closes.
  const proOnlyContent: DynamicFreemiumPanelContent[] = [
    workspaceLogCount,
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
