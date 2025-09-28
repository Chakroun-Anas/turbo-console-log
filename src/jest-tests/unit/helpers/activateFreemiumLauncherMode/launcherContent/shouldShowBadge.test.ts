import { shouldShowBadge } from '@/helpers/activateFreemiumLauncherMode/launcherContent/shouldShowBadge';

describe('shouldShowBadge', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return true when no last access date exists', () => {
    const result = shouldShowBadge('2025-09-27', undefined);
    expect(result).toBe(true);
  });

  it('should return false when no content date exists', () => {
    const result = shouldShowBadge(undefined, '2025-09-26');
    expect(result).toBe(false);
  });

  it('should return true when content date is after last access', () => {
    const result = shouldShowBadge('2025-09-27', '2025-09-26');
    expect(result).toBe(true);
  });

  it('should return false when last access is same as content date', () => {
    const result = shouldShowBadge('2025-09-27', '2025-09-27');
    expect(result).toBe(false);
  });

  it('should return false when last access is after content date', () => {
    const result = shouldShowBadge('2025-09-27', '2025-09-28');
    expect(result).toBe(false);
  });

  it('should handle ISO date strings correctly', () => {
    const contentDate = '2025-09-27T10:00:00.000Z';
    const accessDate = '2025-09-27T09:00:00.000Z';

    const result = shouldShowBadge(contentDate, accessDate);
    expect(result).toBe(true);
  });

  it('should handle time precision correctly', () => {
    const contentDate = '2025-09-27T10:00:01.000Z'; // 1 second later
    const accessDate = '2025-09-27T10:00:00.000Z';

    const result = shouldShowBadge(contentDate, accessDate);
    expect(result).toBe(true);
  });

  it('should return true for both undefined parameters', () => {
    const result = shouldShowBadge(undefined, undefined);
    expect(result).toBe(true);
  });

  it('should handle invalid date strings gracefully', () => {
    // JavaScript Date constructor returns Invalid Date for invalid strings
    // getTime() on Invalid Date returns NaN
    // NaN > NaN is false, so function should return false
    const result = shouldShowBadge('invalid-date', 'also-invalid');
    expect(result).toBe(false);
  });

  it('should handle mixed valid and invalid dates', () => {
    // Content date invalid, access date valid
    const result1 = shouldShowBadge('invalid-date', '2025-09-27');
    expect(result1).toBe(false);

    // Content date valid, access date invalid - should return false since NaN comparison
    const result2 = shouldShowBadge('2025-09-27', 'invalid-date');
    expect(result2).toBe(false);
  });
});
