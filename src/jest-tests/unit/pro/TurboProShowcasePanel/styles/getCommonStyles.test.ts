import { getCommonStyles } from '@/pro/TurboProShowcasePanel/styles/getCommonStyles';

describe('getCommonStyles', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return CSS styles as a string', () => {
    const result = getCommonStyles();

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include basic body styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('body {');
    expect(result).toContain('font-family:');
    expect(result).toContain('background-color: #1e1e1e');
    expect(result).toContain('color: #ffffff');
    expect(result).toContain('line-height: 1.6');
  });

  it('should include heading styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('h1, h2, h3 {');
    expect(result).toContain('font-weight: bold');
  });

  it('should include link styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('a {');
    expect(result).toContain('color: #48BFE3');
    expect(result).toContain('text-decoration: none');
    expect(result).toContain('a:hover {');
    expect(result).toContain('text-decoration: underline');
  });

  it('should include color utility classes', () => {
    const result = getCommonStyles();

    expect(result).toContain('.primary-color { color: #FF6B6B; }');
    expect(result).toContain('.secondary-color { color: #FFC947; }');
    expect(result).toContain(
      '.info-color { color: #48BFE3; font-weight: bold; }',
    );
  });

  it('should include container styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.container {');
    expect(result).toContain('max-width: 800px');
    expect(result).toContain('margin: 0 auto');
    expect(result).toContain('padding: 16px');
  });

  it('should include dynamic content styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.dynamic-content {');
    expect(result).toContain('background: rgba(255, 255, 255, 0.08)');
    expect(result).toContain('border-radius: 8px');
    expect(result).toContain('border-left: 4px solid #48BFE3');
  });

  it('should include survey section styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.survey-section');
    expect(result).toContain('.survey-cta');
  });

  it('should include table styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.commands-table');
    expect(result).toContain('.commands-table th,');
    expect(result).toContain('.commands-table td');
  });

  it('should include countdown widget styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.countdown-widget');
    expect(result).toContain('.countdown-cta');
  });

  it('should include article card styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.article-card');
    expect(result).toContain('.article-image');
    expect(result).toContain('.article-title');
    expect(result).toContain('.article-desc');
  });

  it('should include footer styles', () => {
    const result = getCommonStyles();

    expect(result).toContain('.footer');
  });

  it('should include responsive styles or breakpoints', () => {
    const result = getCommonStyles();

    // Check for responsive elements like media queries or flexible layouts
    expect(
      result.includes('@media') ||
        result.includes('flex') ||
        result.includes('grid') ||
        result.includes('max-width'),
    ).toBe(true);
  });

  it('should be consistent with VS Code dark theme colors', () => {
    const result = getCommonStyles();

    // Verify dark theme color palette
    expect(result).toContain('#1e1e1e'); // Dark background
    expect(result).toContain('#ffffff'); // Light text
    expect(result).toContain('#48BFE3'); // Accent blue
    expect(result).toContain('#FF6B6B'); // Primary red
    expect(result).toContain('#FFC947'); // Secondary yellow
  });

  it('should include proper CSS syntax', () => {
    const result = getCommonStyles();

    // Basic CSS syntax validation
    const openBraces = (result.match(/{/g) || []).length;
    const closeBraces = (result.match(/}/g) || []).length;

    expect(openBraces).toBe(closeBraces);
    expect(result).toContain(';'); // Should have CSS property terminations
  });

  it('should not contain invalid CSS characters', () => {
    const result = getCommonStyles();

    // Should not contain script tags or other invalid content for CSS
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).not.toContain('javascript:');
  });
});
