import { TURBO_CAMPAIGN, isCampaignLive } from '@/pro/campaign';

describe('isCampaignLive', () => {
  const targetMs = TURBO_CAMPAIGN.countdownTarget.getTime();

  it('is live strictly before the countdown target', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(targetMs - 1);
    expect(isCampaignLive()).toBe(true);
    nowSpy.mockRestore();
  });

  it('is not live at the exact countdown target millisecond', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(targetMs);
    expect(isCampaignLive()).toBe(false);
    nowSpy.mockRestore();
  });

  it('is not live after the countdown target', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(targetMs + 1);
    expect(isCampaignLive()).toBe(false);
    nowSpy.mockRestore();
  });

  it('is live for a timestamp well before the countdown target', () => {
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(targetMs - 24 * 60 * 60 * 1000);
    expect(isCampaignLive()).toBe(true);
    nowSpy.mockRestore();
  });

  it('is not live for a timestamp well after the countdown target', () => {
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(targetMs + 24 * 60 * 60 * 1000);
    expect(isCampaignLive()).toBe(false);
    nowSpy.mockRestore();
  });
});
