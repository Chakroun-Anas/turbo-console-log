import { DynamicFreemiumPanelContent } from './TurboProShowcasePanel/types';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';

// Offline/error fallback for the release panel, shown only when the website's
// /api/releasePanel endpoint is unreachable. Mirrors variant A of the
// server-side RELEASE_PANEL_VARIANTS['3.30.0'] so users still see real release
// copy; edit both together.
//
// The server normally absolutizes urls and appends UTM params (its
// enrichContentUrls step); that step is skipped on this fallback path, so the
// urls below are pre-absolutized and tagged variant=fallback to match the
// 'fallback' label this path already reports in its shown/CTA-click telemetry.
const RELEASE_3300_TRACKING =
  '?utm_source=extension' +
  '&utm_medium=release-panel' +
  '&utm_campaign=release-v3-30-0' +
  '&utm_content=variant-fallback' +
  '&event=releasePanel_3.30.0' +
  '&variant=fallback' +
  '&releaseVersion=3.30.0';

const RELEASE_3300_CTA_URL = `${TURBO_WEBSITE_BASE_URL}/pro${RELEASE_3300_TRACKING}`;
const RELEASE_3300_ARTICLE_URL = `${TURBO_WEBSITE_BASE_URL}/articles/release-3300${RELEASE_3300_TRACKING}`;

export const RELEASE_PANEL_FALLBACK_CONTENT: Record<
  string,
  Array<DynamicFreemiumPanelContent>
> = {
  '3.30.0': [
    {
      type: 'paragraph',
      component: {
        title: '📐 Logs Indented Like Your Code, Free for Everyone',
        content:
          'v3.30.0 is about the spaces before a log. A log could land on the right line with the wrong indent: a value selected inside a multi-line statement got a log indented too deep, a log in an empty block sat level with its braces, and code Turbo rewrote around a log kept its old indent. All three now follow the code around them in JavaScript, TypeScript, and PHP, and every fix is pinned by a test.',
      },
      order: 1,
    },
    {
      type: 'paragraph',
      component: {
        title: '🤝 Your License Funds the Free Core',
        content:
          'The fixes in this release are free, like every improvement to log insertion since 2018. Turbo Pro is what pays for them. If Turbo saves you time every day, a Pro license is a one-time payment that funds the next round of fixes and gets you complete log management today, with every future update included.',
      },
      order: 2,
    },
    {
      type: 'paragraph',
      component: {
        title: '💎 Everything Turbo Pro Includes',
        content:
          'Turbo Pro lists every debug log across your workspace in one tree. Navigate, search and filter them, with git-aware filtering, clean them up yourself, or let auto-cleanup on commit do it. It stays instant even on huge codebases, and comes with priority email support.',
      },
      order: 3,
    },
    {
      type: 'media-showcase-cta',
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-pro-illustration.png`,
        ],
        cta: {
          text: 'Check Turbo Pro',
          url: RELEASE_3300_CTA_URL,
        },
      },
      order: 4,
    },
    {
      type: 'article',
      component: {
        title: 'v3.30.0: Logs Indented Like Your Code',
        description:
          'Where a log used to get the wrong spaces, and how the engine indents it now.',
        illustrationSrc: `${TURBO_WEBSITE_BASE_URL}/assets/turbo-full-ast-engine-wide.png`,
        illustrationFocus: 'top',
        url: RELEASE_3300_ARTICLE_URL,
      },
      order: 5,
    },
  ],
};
