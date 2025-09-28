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

    expect(result).toContain('🎉 New Dynamic Panel!');
    expect(result).toContain('This panel now updates automatically with the latest Turbo Console Log news');
    expect(result).toContain('class="dynamic-content"');
  });

  it('should contain static survey section', () => {
    const result = getStaticHtml();

    expect(result).toContain('🚀 Shape Turbo&#x27;s Future');
    expect(result).toContain('Help us decide what&#x27;s next');
    expect(result).toContain('class="survey-section"');
    expect(result).toContain('class="survey-cta"');
  });

  it('should include survey onclick handler with correct URL', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/community-survey', 'survey', '📝 Take Survey'); return false;\"",
    );
    expect(result).toContain('📝 Take Survey');
    expect(result).toContain('style="cursor: pointer;"');
  });

  it('should contain articles showcase section', () => {
    const result = getStaticHtml();

    expect(result).toContain('📚 Featured Turbo Articles');
    expect(result).toContain('Deep dive into how Turbo&#x27;s AST engine');
    expect(result).toContain('class="articles-grid"');
  });

  it('should include articles CTA with correct URL', () => {
    const result = getStaticHtml();

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/turbo-full-ast-engine', 'article', 'Understanding the Full AST Engine')\"",
    );
    expect(result).toContain('Understanding the Full AST Engine');
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
    const surveyIndex = result.indexOf('class="survey-section"');
    const commandsIndex = result.indexOf('class="commands-table"');
    const articlesIndex = result.indexOf('class="articles-grid"');

    // Verify order: dynamic content, then survey, then commands table, then articles
    expect(dynamicContentIndex).toBeLessThan(surveyIndex);
    expect(surveyIndex).toBeLessThan(commandsIndex);
    expect(commandsIndex).toBeLessThan(articlesIndex);
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
