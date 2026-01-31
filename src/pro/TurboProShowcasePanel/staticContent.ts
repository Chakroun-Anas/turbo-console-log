import { DynamicFreemiumPanel, DynamicFreemiumPanelContent } from './types';

// const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Static content provider that mirrors the DynamicFreemiumPanelInteractor
 * This provides consistent content structure for the static version
 */
export function getStaticContent(): DynamicFreemiumPanel {
  const content: DynamicFreemiumPanelContent[] = [
    {
      type: 'paragraph',
      order: 2,
      component: {
        title: '🚀 New: Turbo Pro Git Integration',
        content:
          "Turbo PRO now tracks your Git changes in real-time. The new 'Changed Files Only' filter shows logs exclusively from files you've staged, modified, or added—no noise from the rest of your workspace.",
      },
    },
    {
      type: 'paragraph',
      order: 3,
      component: {
        title: '🎯 One-Click Cleanup Before Commit',
        content:
          'Enable the filter, clean up all debugging logs from your changed files with one click. See only what matters, clean up confidently, commit production-ready code.',
      },
    },
  ];

  return {
    tooltip: 'See Turbo Pro In Action 🚀',
    date: new Date('2024-12-02T00:00:00.000Z'),
    content,
  };
}
