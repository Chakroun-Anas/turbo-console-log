import { DynamicFreemiumPanelContent } from './TurboProShowcasePanel/types';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';

// Offline/error fallback for the release panel, shown only when the website's
// /api/releasePanel endpoint is unreachable. Mirrors variant A of the
// server-side RELEASE_PANEL_VARIANTS so users still see real release copy.
//
// The server normally absolutizes CTA urls and appends UTM params (its
// enrichContentUrls step); that step is skipped on this fallback path, so the
// url below is pre-absolutized and tagged variant=fallback to match the
// 'fallback' label this path already reports in its shown/CTA-click telemetry.
const RELEASE_3270_CTA_URL =
  `${TURBO_WEBSITE_BASE_URL}/pro` +
  '?utm_source=extension' +
  '&utm_medium=release-panel' +
  '&utm_campaign=release-v3-27-0' +
  '&utm_content=variant-fallback' +
  '&event=releasePanel_3.27.0' +
  '&variant=fallback' +
  '&releaseVersion=3.27.0';

export const RELEASE_PANEL_FALLBACK_CONTENT: Record<
  string,
  Array<DynamicFreemiumPanelContent>
> = {
  '3.27.0': [
    {
      type: 'media-showcase-cta',
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-console-log-pro-wide.png`,
        ],
        tagline: 'Outgrown single logs? Turbo Pro manages all of them.',
        subtitle:
          'Search, filter, and bulk-clean every debug log across your workspace, and keep the free core funded. One-time payment, lifetime access.',
        cta: {
          text: 'Get Turbo Pro',
          url: RELEASE_3270_CTA_URL,
        },
      },
      order: 1,
    },
    {
      type: 'paragraph',
      component: {
        title: '🤝 Free Core, Funded by Pro',
        content:
          "The core Turbo Console Log is free, and it stays free: intelligent, one-keystroke log insertion across JavaScript, TypeScript, Python, and PHP. Turbo Pro is the paid edition that funds that work. When a single log isn't enough and you're managing them across a whole codebase, Pro is there when you're ready.",
      },
      order: 2,
    },
    {
      type: 'paragraph',
      component: {
        title: '💎 Everything Turbo Pro Includes',
        content:
          "Alongside auto-cleanup on commit, Turbo Pro lets you navigate, search, filter, and bulk-clean every debug log across your entire workspace. It stays instant even on huge codebases, with git-aware filtering. It's a one-time payment for lifetime access, every future update included, and priority email support. No subscription.",
      },
      order: 3,
    },
    {
      type: 'paragraph',
      component: {
        title: '🧹 The Newest Capability: Auto-Cleanup on Commit',
        content:
          "The latest addition to Pro is auto-cleanup on commit. The moment you commit, it removes the debug logs from the lines you changed. It always previews first, and the scope is always yours. No manual strip-before-commit, no console.log slipping into review. It's why developers are going Pro.",
      },
      order: 4,
    },
  ],
};
