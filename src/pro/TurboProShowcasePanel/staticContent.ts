import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';

/**
 * Static content provider that mirrors the DynamicFreemiumPanelInteractor
 * This provides consistent content structure for the static version
 */
export function getStaticContent(): DynamicFreemiumPanel {
  const content: DynamicFreemiumPanelContent[] = [
    {
      type: 'paragraph',
      component: {
        title: '🚀 Stay Ahead with Turbo!',
        content:
          'The latest feature previews, Pro upgrade events, and key news, delivered automatically right inside your favorite extension panel.',
      },
    },
    {
      type: 'countdown',
      component: {
        eventName: 'Coming in v3.8.0: Hide Logs in the Pro Panel 🎭',
        targetDateUTC: new Date('2025-10-06T00:00:00.000Z'),
        illustrationSrc: 'turbo-pro-tree.png',
        CTA: {
          text: 'Sneak peek at v3.8.0',
          url: 'https://www.turboconsolelog.io/articles/v380-hide-logs-teaser',
        },
      },
    },
    {
      type: 'article',
      component: {
        title: 'Debugging with Memory: Why Turbo PRO Panel Matters!',
        description:
          'Discover how Turbo PRO’s tree panel acts as a debugging memory, helping you stay in flow and regain lost context.',
        illustrationSrc:
          'https://www.turboconsolelog.io/assets/turbo-pro-illustration.png',
        url: 'https://www.turboconsolelog.io/articles/debugging-memory',
      },
    },
    {
      type: 'article',
      component: {
        title: 'Turbo PRO v2 Benchmark: Real-World Performance',
        description:
          'We stress-tested Turbo PRO v2 on React, Storybook, and Vite. See how it blitzes through large codebases with rapid tree construction and instant log syncs.',
        illustrationSrc:
          'https://www.turboconsolelog.io/assets/benchmark-pro-v2.png',
        url: 'https://www.turboconsolelog.io/articles/benchmark-pro-v2',
      },
    },
  ];

  return {
    tooltip: 'v3.8.0 Hide Logs Preview 🎭',
    date: new Date('2025-09-29T12:00:00.000Z'),
    content,
  };
}
