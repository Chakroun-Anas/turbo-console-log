import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Static content provider that mirrors the DynamicFreemiumPanelInteractor
 * This provides consistent content structure for the static version
 */
export function getStaticContent(): DynamicFreemiumPanel {
  const content: DynamicFreemiumPanelContent[] = [
    {
      type: 'paragraph',
      order: 1,
      component: {
        title: '🔬 v3.18.0: Five Fixes Live. Now Help Us Find the Sixth',
        content:
          "v3.18.0 sharpens log placement for five real TypeScript and Angular code patterns found in production. We've also launched a dedicated Edge Cases Reporting page where you can report any pattern Turbo still gets wrong in your codebase. Every edge case you submit becomes a test case that makes the extension smarter for everyone.",
      },
    },
    {
      type: 'media-showcase-cta',
      order: 2,
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/report-edge-cases-illustration.png`,
        ],
        cta: {
          text: 'Read Full Article',
          url: `${TURBO_WEBSITE_BASE_URL}/articles/release-3180`,
        },
      },
    },
  ];

  return {
    tooltip: 'v3.18.0: Five Fixes + Edge Cases Reporting 🔬',
    date: new Date('2026-03-12T20:00:00.000Z'),
    content,
  };
}
