import { DynamicFreemiumPanelContent } from './TurboProShowcasePanel/types';
import { TURBO_CAMPAIGN } from './campaign';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';

// Offline/error fallback for the release panel, shown only when the website's
// /api/releasePanel endpoint is unreachable. Mirrors variant A of the
// server-side RELEASE_PANEL_VARIANTS so users still see real release copy.
//
// The server normally absolutizes CTA urls and appends UTM params (its
// enrichContentUrls step); that step is skipped on this fallback path, so the
// url below is pre-absolutized and tagged variant=fallback to match the
// 'fallback' label this path already reports in its shown/CTA-click telemetry.
const RELEASE_3250_CTA_URL =
  `${TURBO_WEBSITE_BASE_URL}/articles/release-3250` +
  '?utm_source=extension' +
  '&utm_medium=release-panel' +
  '&utm_campaign=release-v3-25-0' +
  '&utm_content=variant-fallback' +
  '&event=releasePanel_3.25.0' +
  '&variant=fallback' +
  '&releaseVersion=3.25.0';

// v3.26.0 fallback CTA — pre-absolutized + tagged the same way RELEASE_3250_CTA_URL
// is, since this path skips the server's enrichContentUrls step. No discount
// code needed: /pro applies the campaign discount to every visitor on its
// own while the campaign is live, regardless of which link they arrived from.
const RELEASE_3260_CTA_URL =
  `${TURBO_WEBSITE_BASE_URL}/pro` +
  '?utm_source=extension' +
  '&utm_medium=release-panel' +
  '&utm_campaign=release-v3-26-0' +
  '&utm_content=variant-fallback' +
  '&event=releasePanel_3.26.0' +
  '&variant=fallback' +
  '&releaseVersion=3.26.0';

export const RELEASE_PANEL_FALLBACK_CONTENT: Record<
  string,
  Array<DynamicFreemiumPanelContent>
> = {
  '3.25.0': [
    {
      type: 'paragraph',
      component: {
        title: '🧹 v3.25.0: Never Commit a Debug Log Again',
        content:
          'You add debug logs to move fast — then you have to remember to strip them before they reach a commit. Turbo Pro now does it for you: the moment you commit, the debug logs in your changed lines are removed automatically — always previewed first, and the scope is under your control. Curious how it works?',
      },
      order: 1,
    },
    {
      type: 'media-showcase-cta',
      component: {
        illustrationSrcs: [
          `${TURBO_WEBSITE_BASE_URL}/assets/turbo-commit-auto-cleanup.webp`,
        ],
        cta: {
          text: 'Read the Full Story',
          url: RELEASE_3250_CTA_URL,
        },
      },
      order: 2,
    },
    {
      type: 'paragraph',
      component: {
        title: '📣 A New Way We Share Updates',
        content:
          'The old in-editor notifications? A lot of you hated them — and fair enough, they were intrusive. So we changed how this works: release news now lives in this panel. You see it once per release, then it is gone — no pop-ups, no nagging. Need it again? It is always one click away in the status bar.',
      },
      order: 3,
    },
  ],
  '3.26.0': [
    {
      type: 'countdown',
      component: {
        eventName: TURBO_CAMPAIGN.eventName,
        targetDateUTC: TURBO_CAMPAIGN.countdownTarget,
        illustrationSrc: `${TURBO_WEBSITE_BASE_URL}/assets/turbo-auto-cleanup-discount.png`,
        CTA: {
          text: 'Get 30% Off Turbo Pro',
          url: RELEASE_3260_CTA_URL,
        },
      },
      order: 1,
    },
    {
      type: 'paragraph',
      component: {
        title: '🎉 30% Off Turbo Pro, This Week Only',
        content:
          "To celebrate auto-cleanup on commit, Turbo Pro is 30% off for one week. No promo code to remember. It's already applied at checkout. Grab it before the timer above runs out.",
      },
      order: 2,
    },
    {
      type: 'paragraph',
      component: {
        title: '💎 Everything Turbo Pro Includes',
        content:
          "Beyond auto-cleanup on commit, Turbo Pro lets you navigate, search, filter, and bulk-clean every debug log across your entire workspace, instantly, even on huge codebases. It's a one-time payment for lifetime access, every future update included, and priority support whenever you need it.",
      },
      order: 3,
    },
    {
      type: 'paragraph',
      component: {
        title: '🧹 The Newest Addition: Auto-Cleanup on Commit',
        content:
          'The moment you commit, auto-cleanup removes the debug logs in your changed lines automatically. It is always previewed first, and the scope is entirely yours. No more manual strip-before-commit, no more forgotten console.logs in review.',
      },
      order: 4,
    },
  ],
};
