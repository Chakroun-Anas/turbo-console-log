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

    expect(result).toContain('Turbo v3.8.0 is Live ⚡️ 🌳');
    expect(result).toContain(
      'Hide Logs (Pro) is here — plus a new Acorn AST engine',
    );
    expect(result).toContain('class="dynamic-content"');
  });

  it('should contain countdown section only if date is in the future', () => {
    const result = getStaticHtml();

    // Countdown only shows if the target date hasn't passed
    // Since the static content has a date of 2025-10-06 and current date is past that,
    // the countdown will not be present
    const hasCountdown = result.includes('class="countdown-widget"');

    if (hasCountdown) {
      expect(result).toContain('Coming in v3.8.0: Hide Logs in the Pro Panel');
      expect(result).toContain('Sneak peek at v3.8.0');
      expect(result).toContain('class="countdown-widget"');
      expect(result).toContain('class="countdown-cta"');
    } else {
      // If countdown has passed, it should not be in the HTML
      expect(result).not.toContain('class="countdown-widget"');
      expect(result).not.toContain(
        'Coming in v3.8.0: Hide Logs in the Pro Panel',
      );
    }
  });

  it('should include countdown onclick handler with correct URL when countdown is present', () => {
    const result = getStaticHtml();

    const hasCountdown = result.includes('class="countdown-widget"');

    if (hasCountdown) {
      expect(result).toContain(
        "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/v380-hide-logs-teaser', 'countdown', 'Sneak peek at v3.8.0'); return false;\"",
      );
      expect(result).toContain('Sneak peek at v3.8.0');
      expect(result).toContain('style="cursor: pointer;"');
    } else {
      // Countdown has passed, so these elements won't be present
      expect(result).not.toContain('v380-hide-logs-teaser');
    }
  });

  it('should contain articles showcase section', () => {
    const result = getStaticHtml();

    expect(result).toContain('📚 Featured Turbo Articles');
    expect(result).toContain(
      'Turbo Sundays #1: As a developer, always have your own side project ✨',
    );
    expect(result).toContain('The Story Behind Turbo Console Log');
    expect(result).toContain('class="articles-grid"');
  });

  it('should include articles CTA with correct URL', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/turbo-sundays-001?utm_source=panel&amp;utm_campaign=release_380&amp;utm_medium=panel_cta_article', 'article', 'Turbo Sundays #1: As a developer, always have your own side project ✨')\"",
    );
    expect(result).toContain(
      'Turbo Sundays #1: As a developer, always have your own side project ✨',
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
    const mediaShowcaseIndex = result.indexOf('class="media-showcase-cta"');
    const articlesIndex = result.indexOf('class="articles-grid"');

    // Dynamic content should always be present
    expect(dynamicContentIndex).toBeGreaterThan(-1);

    // Articles should always be present
    expect(articlesIndex).toBeGreaterThan(-1);

    // Media showcase CTA might be present
    // If present, it should be after dynamic content
    if (mediaShowcaseIndex > -1) {
      expect(dynamicContentIndex).toBeLessThan(mediaShowcaseIndex);
    }

    // If countdown is present, verify order: dynamic content, then countdown, then media showcase (if exists), then articles
    if (countdownIndex > -1) {
      expect(dynamicContentIndex).toBeLessThan(countdownIndex);
      if (mediaShowcaseIndex > -1) {
        expect(countdownIndex).toBeLessThan(mediaShowcaseIndex);
        expect(mediaShowcaseIndex).toBeLessThan(articlesIndex);
      } else {
        expect(countdownIndex).toBeLessThan(articlesIndex);
      }
    } else {
      // If countdown is not present (date passed), dynamic content should come before articles
      expect(dynamicContentIndex).toBeLessThan(articlesIndex);
    }
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
