import { createReleasePanelStatusBarItem } from '../../../helpers/createReleasePanelStatusBarItem';
import { TURBO_CAMPAIGN } from '@/pro/campaign';

// Relative to the real, currently-configured countdownTarget rather than a
// hardcoded mock date — these stay correct as that date moves (as it has
// throughout this release) without needing to touch the tests.
const TARGET_MS = TURBO_CAMPAIGN.countdownTarget.getTime();
const PROMO_SUFFIX = `${TURBO_CAMPAIGN.percentage}% off`;

function msBeforeTarget(offsetMs: number): Date {
  return new Date(TARGET_MS - offsetMs);
}

describe('createReleasePanelStatusBarItem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the plain rocket text when campaignActive is false', () => {
    const item = createReleasePanelStatusBarItem('3.26.0', false);

    expect(item.text).toBe('$(rocket) Turbo v3.26.0');
    expect(item.tooltip).toBe("What's New in Turbo Console Log v3.26.0");
  });

  it('shows a live countdown suffix, down to seconds, when campaignActive is true', () => {
    jest.setSystemTime(msBeforeTarget(2 * 24 * 60 * 60 * 1000)); // 2 days before target

    const item = createReleasePanelStatusBarItem('3.26.0', true);

    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 2d 0h 0m 0s`,
    );
    expect(item.tooltip).toContain(`${PROMO_SUFFIX} Turbo Pro this week`);
  });

  it('ticks the countdown down every second, without recreating the item', () => {
    jest.setSystemTime(msBeforeTarget(2 * 60 * 60 * 1000 + 2000)); // 2h 2s before target

    const item = createReleasePanelStatusBarItem('3.26.0', true);
    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 2h 0m 2s`,
    );

    jest.advanceTimersByTime(1000);
    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 2h 0m 1s`,
    );

    jest.advanceTimersByTime(1000);
    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 2h 0m 0s`,
    );

    jest.advanceTimersByTime(1000);
    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 1h 59m 59s`,
    );

    jest.advanceTimersByTime(60 * 60 * 1000); // +1h
    expect(item.text).toBe(
      `$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 59m 59s`,
    );
  });

  it('self-reverts to the plain rocket text the instant countdownTarget passes', () => {
    jest.setSystemTime(msBeforeTarget(2000)); // 2s before target

    const item = createReleasePanelStatusBarItem('3.26.0', true);
    expect(item.text).toBe(`$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 2s`);

    jest.advanceTimersByTime(1000);
    expect(item.text).toBe(`$(rocket) Turbo v3.26.0 — ${PROMO_SUFFIX} · 1s`);

    jest.advanceTimersByTime(1000);
    expect(item.text).toBe('$(rocket) Turbo v3.26.0');
    expect(item.tooltip).toBe("What's New in Turbo Console Log v3.26.0");
  });

  it('does not schedule a live interval when the target has already passed at creation time', () => {
    jest.setSystemTime(new Date(TARGET_MS + 24 * 60 * 60 * 1000)); // 1 day after target
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    const item = createReleasePanelStatusBarItem('3.26.0', true);

    expect(item.text).toBe('$(rocket) Turbo v3.26.0');
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('clears the live interval when the item is disposed', () => {
    jest.setSystemTime(msBeforeTarget(60 * 60 * 1000)); // 1h before target
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const item = createReleasePanelStatusBarItem('3.26.0', true);
    item.dispose();

    expect(clearIntervalSpy).toHaveBeenCalled();

    // Advancing time after disposal must not resurrect the countdown text.
    const textAtDisposal = item.text;
    jest.advanceTimersByTime(10 * 60 * 1000);
    expect(item.text).toBe(textAtDisposal);
  });

  it('always sets the release-panel command and shows the item, regardless of campaign state', () => {
    jest.setSystemTime(msBeforeTarget(60 * 60 * 1000)); // 1h before target

    const promoItem = createReleasePanelStatusBarItem('3.26.0', true);
    const plainItem = createReleasePanelStatusBarItem('3.26.0', false);

    expect(promoItem.command).toBe('turboConsoleLog.showReleasePanel');
    expect(plainItem.command).toBe('turboConsoleLog.showReleasePanel');
    expect(promoItem.show).toHaveBeenCalled();
    expect(plainItem.show).toHaveBeenCalled();
  });
});
