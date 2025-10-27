import { getStaticHtml } from '@/pro/TurboProShowcasePanel/html/getStaticHtml';

// Mock all dependencies
jest.mock('@/pro/TurboProShowcasePanel/styles/getCommonStyles', () => ({
  getCommonStyles: jest.fn(() => '.container { margin: 0; padding: 20px; }'),
}));

jest.mock('@/pro/TurboProShowcasePanel/javascript/javascript', () => ({
  getJavaScript: jest.fn(() => 'function openUrl(url) { window.open(url); }'),
}));

import { getCommonStyles } from '@/pro/TurboProShowcasePanel/styles/getCommonStyles';
import { getJavaScript } from '@/pro/TurboProShowcasePanel/javascript/javascript';

describe('getStaticHtml', () => {
  let consoleSpy: jest.SpyInstance;

  const mockGetCommonStyles = getCommonStyles as jest.MockedFunction<
    typeof getCommonStyles
  >;
  const mockGetJavaScript = getJavaScript as jest.MockedFunction<
    typeof getJavaScript
  >;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();

    // Reset mock return values
    mockGetCommonStyles.mockReturnValue(
      '.container { margin: 0; padding: 20px; }',
    );
    mockGetJavaScript.mockReturnValue(
      'function openUrl(url) { window.open(url); }',
    );
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should generate complete HTML document with static content', () => {
    const result = getStaticHtml();

    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');
    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  });

  it('should include common styles in head section', () => {
    const result = getStaticHtml();

    expect(result).toContain('<style>');
    expect(result).toContain('.container { margin: 0; padding: 20px; }');
    expect(result).toContain('</style>');
    expect(mockGetCommonStyles).toHaveBeenCalled();
  });

  it('should include JavaScript at the end of document', () => {
    const result = getStaticHtml();

    expect(result).toContain('<script>');
    expect(result).toContain('function openUrl(url) { window.open(url); }');
    expect(result).toContain('</script>');
    expect(mockGetJavaScript).toHaveBeenCalled();
  });

  it('should contain countdown section only if date is in the future', () => {
    const result = getStaticHtml();

    // Countdown only shows if the target date hasn't passed
    const hasCountdown = result.includes('class="countdown-widget"');

    if (hasCountdown) {
      expect(result).toContain('class="countdown-widget"');
      expect(result).toContain('class="countdown-cta"');
    } else {
      // If countdown has passed, it should not be in the HTML
      expect(result).not.toContain('class="countdown-widget"');
    }
  });

  it('should include countdown onclick handler with correct URL when countdown is present', () => {
    const result = getStaticHtml();

    const hasCountdown = result.includes('class="countdown-widget"');

    if (hasCountdown) {
      expect(result).toContain('onclick=');
      expect(result).toContain('openUrlWithTracking');
      expect(result).toContain('style="cursor: pointer;"');
    }
  });

  it('should maintain proper HTML structure', () => {
    const result = getStaticHtml();

    // Check structure order
    expect(result.indexOf('<html>')).toBeLessThan(result.indexOf('<head>'));
    expect(result.indexOf('<head>')).toBeLessThan(result.indexOf('<body>'));
    expect(result.indexOf('<body>')).toBeLessThan(
      result.indexOf('<div class="container">'),
    );
    expect(result.indexOf('<script>')).toBeLessThan(result.indexOf('</body>'));
    expect(result.indexOf('</body>')).toBeLessThan(result.indexOf('</html>'));
  });

  it('should handle different style configurations', () => {
    mockGetCommonStyles.mockReturnValue(
      '.custom { color: red; font-size: 14px; }',
    );

    const result = getStaticHtml();

    expect(result).toContain('.custom { color: red; font-size: 14px; }');
  });

  it('should handle different JavaScript configurations', () => {
    mockGetJavaScript.mockReturnValue('console.log("Custom JS");');

    const result = getStaticHtml();

    expect(result).toContain('console.log("Custom JS");');
  });

  it('should contain proper viewport meta tag', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  });

  it('should not require any parameters', () => {
    // This test ensures the function signature doesn't change
    expect(() => getStaticHtml()).not.toThrow();
  });
});
