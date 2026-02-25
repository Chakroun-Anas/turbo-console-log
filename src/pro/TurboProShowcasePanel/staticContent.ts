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
        title: '🎯 v3.17.0: A Notification System Built on Respect',
        content:
          "We've added context-aware timing to Turbo's notification system. After analyzing tens of thousands of interactions, notifications now consider your workspace state, time of day, and day of week. This joins our existing safeguards: bi-weekly releases, 48-hour cooldown, 6/month maximum, server-side enforcement, and three-strike pause.",
      },
    },
    {
      type: 'media-showcase-cta',
      order: 2,
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-notifications-illustration.png`,
        ],
        cta: {
          text: 'Read Full Article',
          url: `${TURBO_WEBSITE_BASE_URL}/articles/release-3170`,
        },
      },
    },
  ];

  return {
    tooltip: 'v3.17.0: Context-Aware Notifications 🎯',
    date: new Date('2026-02-24T20:00:00.000Z'),
    content,
  };
}
