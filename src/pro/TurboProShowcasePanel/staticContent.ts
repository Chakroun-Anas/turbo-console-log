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
        title: '🔥 Ultimate Workspace Log Manager',
        content:
          'Turbo Console Log Freemium manages only Turbo logs in your active editor. Turbo Console Log PRO lists and manages all logs across your entire workspace. Search, filter, and cleanup hundreds of logs in seconds with the native VS Code tree view.',
      },
    },
    {
      type: 'paragraph',
      order: 2,
      component: {
        title: '⚡ Workspace Log Explorer',
        content:
          'How many logs does your current project have? Turbo Pro gives you the answer in seconds. It lists all logs in a native VS Code tree view, making navigation seamless. In the demo below, 600+ logs are loaded in under 1 second.',
      },
    },
    {
      type: 'video',
      order: 3,
      component: {
        videoSrc: `${TURBO_WEBSITE_BASE_URL}/videos/pro-v2/turbo-pro-tree-navigation.mp4`,
        caption: '⚡ 600+ logs loaded in under 1 second',
        autoplay: false,
        loop: false,
        muted: false,
      },
    },
    {
      type: 'paragraph',
      order: 4,
      component: {
        title: '🚀 Workspace Cleanup by Log Types',
        content:
          'About to push your changes? Need to wipe logs across dozens of files reliably? Turbo Pro makes it effortless. Watch this example where Turbo Pro deletes 400+ logs across 100+ files blazing fast. This same cleanup power works anywhere in your tree view: entire workspace, single folder, or specific files.',
      },
    },
    {
      type: 'video',
      order: 5,
      component: {
        videoSrc: `${TURBO_WEBSITE_BASE_URL}/videos/pro-v2/turbo-pro-logs-cleanup.mp4`,
        caption: '⚡ Deleted 400 logs across 112 files in a few seconds',
        autoplay: false,
        loop: false,
        muted: false,
      },
    },
    {
      type: 'media-showcase-cta',
      order: 6,
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-pro-illustration.png`,
        ],
        cta: {
          text: 'Upgrade to Turbo PRO →',
          url: `${TURBO_WEBSITE_BASE_URL}/pro?utm_source=panel&utm_campaign=pro_v2_showcase&utm_medium=dynamic_panel`,
        },
      },
    },
    {
      type: 'paragraph',
      order: 7,
      component: {
        title: '🎯 Real-Time Log Filtering',
        content:
          "Your workspace has hundreds of logs but you only care about errors right now? Or maybe you want to hide warnings and focus on everything else? Turbo PRO's filter system updates the tree view instantly as you toggle log types (log, error, warn, info, etc)—no re-scan, no waiting, just pure control over the noise.",
      },
    },
    {
      type: 'video',
      order: 8,
      component: {
        videoSrc: `${TURBO_WEBSITE_BASE_URL}/videos/pro-v2/turbo-pro-filter-logs-in-tree.mp4`,
        caption: '⚡ Filter updates instantly—no re-scan needed',
        autoplay: false,
        loop: false,
        muted: false,
      },
    },
    {
      type: 'paragraph',
      order: 9,
      component: {
        title: '🔍 Instant Log Search',
        content:
          'Remember adding a log for "user authentication" three days ago? Where was it? Which file? Turbo PRO\'s search command lets you type any keyword, shows matching logs instantly, and jumps you to the exact line when you select one. Find any log by content in seconds—no grep, no guessing, no scrolling through files.',
      },
    },
    {
      type: 'video',
      order: 10,
      component: {
        videoSrc: `${TURBO_WEBSITE_BASE_URL}/videos/pro-v2/turbo-pro-search-logs.mp4`,
        caption: '🎯 Find any log by content in seconds',
        autoplay: false,
        loop: false,
        muted: false,
      },
    },
  ];

  return {
    tooltip: 'See Turbo Pro In Action 🚀',
    date: new Date('2024-12-02T00:00:00.000Z'),
    content,
  };
}
