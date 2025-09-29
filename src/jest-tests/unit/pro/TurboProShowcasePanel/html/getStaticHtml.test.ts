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

  it('should contain static dynamic panel content', () => {
    const result = getStaticHtml();

    expect(result).toContain('🚀 Stay Ahead with Turbo!');
    expect(result).toContain(
      'The latest feature previews, Pro upgrade events, and key news, delivered automatically',
    );
    expect(result).toContain('class="dynamic-content"');
  });

  it('should contain countdown section', () => {
    const result = getStaticHtml();

    expect(result).toContain('Coming in v3.8.0: Hide Logs in the Pro Panel');
    expect(result).toContain('Sneak peek at v3.8.0');
    expect(result).toContain('class="countdown-widget"');
    expect(result).toContain('class="countdown-cta"');
  });

  it('should include countdown onclick handler with correct URL', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/v380-hide-logs-teaser', 'countdown', 'Sneak peek at v3.8.0'); return false;\"",
    );
    expect(result).toContain('Sneak peek at v3.8.0');
    expect(result).toContain('style="cursor: pointer;"');
  });

  it('should contain articles showcase section', () => {
    const result = getStaticHtml();

    expect(result).toContain('📚 Featured Turbo Articles');
    expect(result).toContain(
      'Debugging with Memory: Why Turbo PRO Panel Matters!',
    );
    expect(result).toContain('Turbo PRO v2 Benchmark: Real-World Performance');
    expect(result).toContain('class="articles-grid"');
  });

  it('should include articles CTA with correct URL', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/debugging-memory', 'article', 'Debugging with Memory: Why Turbo PRO Panel Matters!')\"",
    );
    expect(result).toContain(
      'Debugging with Memory: Why Turbo PRO Panel Matters!',
    );
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

  it('should include all static sections in proper order', () => {
    const result = getStaticHtml();

    const dynamicContentIndex = result.indexOf('class="dynamic-content"');
    const countdownIndex = result.indexOf('class="countdown-widget"');
    const articlesIndex = result.indexOf('class="articles-grid"');

    // Verify order: dynamic content, then countdown, then articles
    expect(dynamicContentIndex).toBeLessThan(countdownIndex);
    expect(countdownIndex).toBeLessThan(articlesIndex);
    expect(articlesIndex).toBeGreaterThan(-1);
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
