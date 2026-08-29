// v3.28.0 back-from-vacation promo: 30% off Turbo Pro, welcoming developers
// back from their summer break.
// countdownTarget is the sole on/off switch, checked fresh on every call to
// isCampaignLive() below — no separate flag to fall out of sync with it. To
// end the promo early, move countdownTarget into the past and deploy.
// Must mirror the website's src/constants/campaign.ts exactly on code/percentage/
// countdownTarget — there is no shared package between the two repos, so this
// pair is hand-maintained and is the single highest-risk drift point.
export const TURBO_CAMPAIGN = {
  code: 'WELCOMEBACK30',
  percentage: 30,
  countdownTarget: new Date('2026-09-09T00:00:00Z'),
  eventName: 'Welcome Back — 30% Off Turbo Pro',
} as const;

export function isCampaignLive(): boolean {
  return Date.now() < TURBO_CAMPAIGN.countdownTarget.getTime();
}
