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
    const result = getStaticHtml(122);

    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');
    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  });

  it('should include common styles in head section', () => {
    const result = getStaticHtml(1);

    expect(result).toContain('<style>');
    expect(result).toContain('.container { margin: 0; padding: 20px; }');
    expect(result).toContain('</style>');
    expect(mockGetCommonStyles).toHaveBeenCalled();
  });

  it('should include JavaScript at the end of document', () => {
    const result = getStaticHtml(0);

    expect(result).toContain('<script>');
    expect(result).toContain('function openUrl(url) { window.open(url); }');
    expect(result).toContain('</script>');
    expect(mockGetJavaScript).toHaveBeenCalled();
  });

  // The v3.26.0 launch-week promo is over, so the freemium panel no longer
  // renders a countdown — only the analytics card and the Pro showcase CTA.
  it('does not render any countdown widget', () => {
    const result = getStaticHtml(49);

    expect(result).not.toContain('class="countdown-widget"');
    expect(result).not.toContain('turbo-auto-cleanup-discount.png');
  });

  it('should maintain proper HTML structure', () => {
    const result = getStaticHtml(7);

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

    const result = getStaticHtml(12);

    expect(result).toContain('.custom { color: red; font-size: 14px; }');
  });

  it('should handle different JavaScript configurations', () => {
    mockGetJavaScript.mockReturnValue('console.log("Custom JS");');

    const result = getStaticHtml(10);

    expect(result).toContain('console.log("Custom JS");');
  });

  it('should contain proper viewport meta tag', () => {
    const result = getStaticHtml(0);

    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  });

  it('should not require any parameters', () => {
    // This test ensures the function signature doesn't change
    expect(() => getStaticHtml(1)).not.toThrow();
  });

  describe('conditional rendering with workspace metadata', () => {
    const mockMetadata = {
      totalLogs: 150,
      totalFiles: 25,
      repositories: [
        {
          name: 'frontend',
          path: '/workspace/frontend',
          logCount: 100,
          fileCount: 15,
          topNestedFolder: {
            relativePath: 'src/components',
            logCount: 60,
            percentage: 60,
          },
        },
      ],
      logTypeDistribution: [
        { type: 'console.log', count: 100, percentage: 67 },
        { type: 'console.error', count: 50, percentage: 33 },
      ],
    };

    it('should show analytics section when metadata is provided and logCount > 0', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Should contain analytics section
      expect(result).toContain('Your Workspace Analytics');
      expect(result).toContain('150 Logs');

      // Should show the Pro CTA (tagline + button)
      expect(result).toContain('Never commit a debug log again');
      expect(result).toContain('Turn On Auto-Cleanup');

      // Should show the supporting subtitle (mechanism + reassurance)
      expect(result).toContain('Pay once, yours forever.');

      // Pro features now live in the locked board inside the analytics card
      expect(result).toContain('Unlock with Turbo Pro');
    });

    it('should skip analytics section when metadata is null', () => {
      const result = getStaticHtml(100, null);

      // Should NOT contain analytics section
      expect(result).not.toContain('Your Workspace Analytics');
      expect(result).not.toContain('100 Logs');

      // Pro features should still be shown
      expect(result).toContain('Unlock with Turbo Pro');
    });

    it('should skip analytics section when logCount is 0', () => {
      const result = getStaticHtml(0, mockMetadata);

      // Should NOT contain analytics section even with metadata
      expect(result).not.toContain('Your Workspace Analytics');

      // Pro features should still be shown
      expect(result).toContain('Unlock with Turbo Pro');
    });

    it('should show Pro CTA when analytics is shown', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Should contain Pro CTA button and tagline
      expect(result).toContain('Turn On Auto-Cleanup');
      expect(result).toContain('Never commit a debug log again');
    });

    it('should show Pro CTA when analytics is not shown', () => {
      const result = getStaticHtml(100, null);

      // Should still contain CTA
      expect(result).toContain('Turn On Auto-Cleanup');
      expect(result).toContain('Never commit a debug log again');
    });

    it('shows descriptions for hero features and names only for the rest', () => {
      const result = getStaticHtml(123, mockMetadata);

      // Hero (v3.25.0) features render their description...
      expect(result).toContain(
        'Keep debug logs like these out of every commit',
      );
      expect(result).toContain(
        'See exactly what will be removed before you commit',
      );
      // ...supporting features collapse to a name-only row (no description).
      expect(result).toContain('Workspace Tree View');
      expect(result).not.toContain(
        'Manage every log across your files in one place',
      );
    });

    it('should include testimonial in both scenarios', () => {
      const resultWithAnalytics = getStaticHtml(150, mockMetadata);
      const resultWithoutAnalytics = getStaticHtml(100, null);

      // Both should contain the Caio Lemos testimonial
      expect(resultWithAnalytics).toContain('Caio Lemos');
      expect(resultWithoutAnalytics).toContain('Caio Lemos');

      expect(resultWithAnalytics).toContain('The Pro Plan is super worthy');
      expect(resultWithoutAnalytics).toContain('The Pro Plan is super worthy');
    });

    it('should include Auto-Cleanup on Commit feature with version badge', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Newest Pro feature, badged with its version
      expect(result).toContain('Auto-Cleanup on Commit');
      expect(result).toContain('v3.25.0');
      expect(result).toContain(
        'Keep debug logs like these out of every commit',
      );

      // Git Filter is a compact, name-only supporting row (no badge, no description).
      expect(result).toContain('Git Filter');
      expect(result).not.toContain('Focus on the logs in your changed files');
    });

    it('should include all Pro features regardless of analytics visibility', () => {
      const resultWithAnalytics = getStaticHtml(150, mockMetadata);
      const resultWithoutAnalytics = getStaticHtml(0, null);

      const features = [
        'Auto-Cleanup on Commit',
        'Live Cleanup Preview',
        'Git Filter',
        'Workspace Tree View',
      ];

      features.forEach((feature) => {
        expect(resultWithAnalytics).toContain(feature);
        expect(resultWithoutAnalytics).toContain(feature);
      });
    });

    it('should include correct UTM parameters in CTAs', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Should have UTM parameters for tracking
      expect(result).toContain('utm_source=panel');
      expect(result).toContain('utm_campaign=workspace_log_count');
      expect(result).toContain('utm_medium=dynamic_panel');

      // Should have position tracking
      expect(result).toContain('position=after_analytics');
    });

    it('links the "Unlock with Turbo Pro" board header to the Pro page', () => {
      const result = getStaticHtml(150, mockMetadata);

      expect(result).toContain('class="pro-unlock-link"');
      expect(result).toContain('position=locked_board');
      expect(result).toContain('variant=panel-pro-unlock');
    });
  });
});
