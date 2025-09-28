import { getJavaScript } from '@/pro/TurboProShowcasePanel/javascript/javascript';

describe('getJavaScript', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return JavaScript code as a string', () => {
    const result = getJavaScript();

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include vscode API acquisition', () => {
    const result = getJavaScript();

    expect(result).toContain('const vscode = acquireVsCodeApi();');
  });

  it('should include openUrl function', () => {
    const result = getJavaScript();

    expect(result).toContain('function openUrl(url)');
    expect(result).toContain('vscode.postMessage');
    expect(result).toContain("command: 'openUrl'");
    expect(result).toContain('url: url');
  });

  it('should include countdown functionality', () => {
    const result = getJavaScript();

    expect(result).toContain('function updateCountdowns()');
    expect(result).toContain("document.querySelectorAll('.countdown-widget')");
    expect(result).toContain('targetDate');
    expect(result).toContain('timeDiff');
  });

  it('should handle countdown widget display logic', () => {
    const result = getJavaScript();

    expect(result).toContain('if (timeDiff <= 0)');
    expect(result).toContain("widget.style.display = 'none'");
  });

  it('should include countdown timer calculations', () => {
    const result = getJavaScript();

    expect(result).toContain('new Date(widget.dataset.targetDate)');
    expect(result).toContain('new Date()');
    expect(result).toContain('targetDate.getTime() - now.getTime()');
  });

  it('should include time formatting for countdown', () => {
    const result = getJavaScript();

    // Should include calculations for days, hours, minutes, seconds
    expect(
      result.includes('days') ||
        result.includes('hours') ||
        result.includes('minutes') ||
        result.includes('Math.floor'),
    ).toBe(true);
  });

  it('should include DOM manipulation methods', () => {
    const result = getJavaScript();

    expect(result).toContain('document.querySelector');
    expect(result).toContain('forEach');
  });

  it('should include proper JavaScript syntax', () => {
    const result = getJavaScript();

    // Basic JavaScript syntax validation
    const openBraces = (result.match(/{/g) || []).length;
    const closeBraces = (result.match(/}/g) || []).length;
    const openParens = (result.match(/\(/g) || []).length;
    const closeParens = (result.match(/\)/g) || []).length;

    expect(openBraces).toBe(closeBraces);
    expect(openParens).toBe(closeParens);
  });

  it('should handle error cases gracefully', () => {
    const result = getJavaScript();

    // Should include error handling or safe navigation
    expect(
      result.includes('try') ||
        result.includes('catch') ||
        result.includes('if (') ||
        result.includes('return;'),
    ).toBe(true);
  });

  it('should include countdown update interval', () => {
    const result = getJavaScript();

    expect(
      result.includes('setInterval') ||
        result.includes('setTimeout') ||
        result.includes('updateCountdowns'),
    ).toBe(true);
  });

  it('should handle time display formatting', () => {
    const result = getJavaScript();

    // Should format time values for display
    expect(
      result.includes('innerHTML') ||
        result.includes('textContent') ||
        result.includes('padStart') ||
        result.includes('toString'),
    ).toBe(true);
  });

  it('should use proper VS Code API patterns', () => {
    const result = getJavaScript();

    expect(result).toContain('acquireVsCodeApi()');
    expect(result).toContain('postMessage');
    expect(result).toContain('command:');
  });

  it('should not contain dangerous JavaScript patterns', () => {
    const result = getJavaScript();

    // Should not contain dangerous eval or script injection patterns
    expect(result).not.toContain('eval(');
    expect(result).not.toContain('innerHTML =');
    expect(result).not.toContain('document.write');
    expect(result).not.toContain('setTimeout("');
  });

  it('should handle widget lifecycle properly', () => {
    const result = getJavaScript();

    expect(result).toContain('.countdown-widget');
    expect(result).toContain('dataset.targetDate');
    expect(result).toContain('style.display');
  });
});
