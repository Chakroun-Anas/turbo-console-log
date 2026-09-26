import { DynamicFreemiumPanelContent } from './TurboProShowcasePanel/types';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';

// Offline/error fallback for the release panel, shown only when the website's
// /api/releasePanel endpoint is unreachable. Mirrors variant A of the
// server-side RELEASE_PANEL_VARIANTS['3.29.0'] so users still see real release
// copy; edit both together.
//
// The server normally absolutizes urls and appends UTM params (its
// enrichContentUrls step); that step is skipped on this fallback path, so the
// urls below are pre-absolutized and tagged variant=fallback to match the
// 'fallback' label this path already reports in its shown/CTA-click telemetry.
const RELEASE_3290_TRACKING =
  '?utm_source=extension' +
  '&utm_medium=release-panel' +
  '&utm_campaign=release-v3-29-0' +
  '&utm_content=variant-fallback' +
  '&event=releasePanel_3.29.0' +
  '&variant=fallback' +
  '&releaseVersion=3.29.0';

const RELEASE_3290_CTA_URL = `${TURBO_WEBSITE_BASE_URL}/pro${RELEASE_3290_TRACKING}`;
const RELEASE_3290_ARTICLE_URL = `${TURBO_WEBSITE_BASE_URL}/articles/release-3290${RELEASE_3290_TRACKING}`;

export const RELEASE_PANEL_FALLBACK_CONTENT: Record<
  string,
  Array<DynamicFreemiumPanelContent>
> = {
  '3.29.0': [
    {
      type: 'media-showcase-cta',
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-console-log-pro-wide.png`,
        ],
        tagline: 'Every log on the right line. Turbo Pro takes them all out.',
        subtitle:
          'v3.29.0 ships 14 placement fixes to the free engine. Turbo Pro adds auto-cleanup on commit, workspace-wide search, filtering, and bulk cleanup. One-time payment, lifetime access.',
        cta: {
          text: 'Get Turbo Pro',
          url: RELEASE_3290_CTA_URL,
        },
      },
      order: 1,
    },
    {
      type: 'paragraph',
      component: {
        title: '🎯 14 Placement Fixes, Free for Everyone',
        content:
          'v3.29.0 is a release about one promise: when you insert a log, it lands on the right line. We probed the insertion engine against more than 700 real-world React, TypeScript, Node, and framework snippets and fixed the patterns where a log landed in the wrong place: inside an object literal, after a return, before the value it was meant to show, or outside the block where the variable exists. Every fix is pinned by an end-to-end test, so it stays fixed.',
      },
      order: 2,
    },
    {
      type: 'article',
      component: {
        title: 'v3.29.0: 14 Placement Fixes',
        description:
          'The patterns where a log used to land on the wrong line, and how the engine handles them now.',
        illustrationSrc: `${TURBO_WEBSITE_BASE_URL}/assets/turbo-full-ast-engine-wide.png`,
        illustrationFocus: 'top',
        url: RELEASE_3290_ARTICLE_URL,
      },
      order: 3,
    },
    {
      type: 'paragraph',
      component: {
        title: '💎 Everything Turbo Pro Includes',
        content:
          "Alongside auto-cleanup on commit, Turbo Pro lets you navigate, search, filter, and bulk-clean every debug log across your entire workspace. It stays instant even on huge codebases, with git-aware filtering. It's a one-time payment for lifetime access, every future update included, and priority email support. No subscription.",
      },
      order: 4,
    },
    {
      type: 'paragraph',
      component: {
        title: '🤝 Your License Funds the Free Core',
        content:
          'The fixes in this release are free, like every improvement to log insertion since 2018. Turbo Pro is what pays for them. If Turbo saves you time every day, a Pro license is a one-time payment that funds the next round of fixes and gets you complete log management today, with every future update included.',
      },
      order: 5,
    },
  ],
};
