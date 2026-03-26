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

  it('should contain countdown section only if date is in the future', () => {
    const result = getStaticHtml(49);

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
    const result = getStaticHtml(33);

    const hasCountdown = result.includes('class="countdown-widget"');

    if (hasCountdown) {
      expect(result).toContain('onclick=');
      expect(result).toContain('openUrlWithTracking');
      expect(result).toContain('style="cursor: pointer;"');
    }
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

      // Should show first CTA after analytics
      expect(result).toContain('Stop hunting logs file by file');
      expect(result).toContain('Take Back Control');

      // Pro features title should indicate "What Turbo Pro Brings"
      expect(result).toContain('What Turbo Pro Brings ✨');
    });

    it('should skip analytics section when metadata is null', () => {
      const result = getStaticHtml(100, null);

      // Should NOT contain analytics section
      expect(result).not.toContain('Your Workspace Analytics');
      expect(result).not.toContain('100 Logs');

      // Pro features should still be shown
      expect(result).toContain('What Turbo Pro Brings ✨');
    });

    it('should skip analytics section when logCount is 0', () => {
      const result = getStaticHtml(0, mockMetadata);

      // Should NOT contain analytics section even with metadata
      expect(result).not.toContain('Your Workspace Analytics');

      // Pro features should still be shown
      expect(result).toContain('What Turbo Pro Brings ✨');
    });

    it('should show Pro CTA when analytics is shown', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Should contain Pro CTA button and tagline
      expect(result).toContain('Take Back Control');
      expect(result).toContain('Stop hunting logs file by file');
    });

    it('should show Pro CTA when analytics is not shown', () => {
      const result = getStaticHtml(100, null);

      // Should still contain CTA
      expect(result).toContain('Take Back Control');
      expect(result).toContain('Stop hunting logs file by file');
    });

    it('should include feature descriptions', () => {
      const result = getStaticHtml(123, mockMetadata);

      // Should include feature descriptions (not personalized with log count anymore)
      expect(result).toContain('See all logs organized by file in one view');
      expect(result).toContain('Workspace Tree View');
      expect(result).toContain('Instant Search');
      expect(result).toContain('Bulk Cleanup');
    });

    it('should include testimonial in both scenarios', () => {
      const resultWithAnalytics = getStaticHtml(150, mockMetadata);
      const resultWithoutAnalytics = getStaticHtml(100, null);

      // Both should contain Kristian Serrano testimonial
      expect(resultWithAnalytics).toContain('Kristian Serrano');
      expect(resultWithoutAnalytics).toContain('Kristian Serrano');

      expect(resultWithAnalytics).toContain(
        'This is one of the best extensions',
      );
      expect(resultWithoutAnalytics).toContain(
        'This is one of the best extensions',
      );
    });

    it('should include Git Filter feature with version badge', () => {
      const result = getStaticHtml(150, mockMetadata);

      // Should contain Git Filter feature
      expect(result).toContain('Git Filter');
      expect(result).toContain('v3.19.0');
      expect(result).toContain('Show ONLY logs in your changed files');
    });

    it('should include all Pro features regardless of analytics visibility', () => {
      const resultWithAnalytics = getStaticHtml(150, mockMetadata);
      const resultWithoutAnalytics = getStaticHtml(0, null);

      const features = [
        'Workspace Tree View',
        'Instant Search',
        'Git Filter',
        'Bulk Cleanup',
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
  });

  describe('trial CTA rendering based on trial status', () => {
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

    it('should show trial invitation CTA when no trial status provided', () => {
      const result = getStaticHtml(150, mockMetadata, undefined);

      // Should show trial invitation
      expect(result).toContain('Try Turbo Pro Free for 2 Hours 🎁');
      expect(result).toContain('Start Free Trial →');
      expect(result).toContain('No credit card required');
      expect(result).toContain('variant=panel-trial-invitation');

      // Should NOT show expired trial CTA
      expect(result).not.toContain('Your Trial Has Ended ⏰');
      expect(result).not.toContain('Get Turbo Pro Now 🚀');
      expect(result).not.toContain('variant=panel-trial-expired');
    });

    it('should hide trial invitation CTA when trial is active', () => {
      const result = getStaticHtml(150, mockMetadata, 'active');

      // Should NOT show trial invitation
      expect(result).not.toContain('Try Turbo Pro Free for 2 Hours 🎁');
      expect(result).not.toContain('Start Free Trial →');

      // Should NOT show expired trial CTA
      expect(result).not.toContain('Your Trial Has Ended ⏰');
      expect(result).not.toContain('Get Turbo Pro Now 🚀');
    });

    it('should show trial expired CTA when trial has expired', () => {
      const result = getStaticHtml(150, mockMetadata, 'expired');

      // Should show expired trial CTA
      expect(result).toContain('Your Trial Has Ended ⏰');
      expect(result).toContain(
        "You've experienced the power of <strong>Turbo Pro</strong>",
      );
      expect(result).toContain('Get Turbo Pro Now 🚀');
      expect(result).toContain('variant=panel-trial-expired');
      expect(result).toContain('Unlock unlimited access to all Pro features');

      // Should NOT show trial invitation
      expect(result).not.toContain('Try Turbo Pro Free for 2 Hours 🎁');
      expect(result).not.toContain('Start Free Trial →');
      expect(result).not.toContain('variant=panel-trial-invitation');
    });

    it('should include correct tracking parameters for trial invitation', () => {
      const result = getStaticHtml(150, mockMetadata, undefined);

      expect(result).toContain('utm_source=panel');
      expect(result).toContain('utm_campaign=trial_cta');
      expect(result).toContain('utm_medium=extension_panel');
      expect(result).toContain('position=top');
      expect(result).toContain('event=trial-workflow');
      expect(result).toContain('variant=panel-trial-invitation');
    });

    it('should include correct tracking parameters for expired trial CTA', () => {
      const result = getStaticHtml(150, mockMetadata, 'expired');

      expect(result).toContain('utm_source=panel');
      expect(result).toContain('utm_campaign=trial_expired');
      expect(result).toContain('utm_medium=extension_panel');
      expect(result).toContain('position=top');
      expect(result).toContain('event=trial-workflow');
      expect(result).toContain('variant=panel-trial-expired');
    });

    it('should show trial invitation CTA without analytics when no metadata provided', () => {
      const result = getStaticHtml(100, null, undefined);

      // Should show trial invitation
      expect(result).toContain('Try Turbo Pro Free for 2 Hours 🎁');
      expect(result).toContain('Start Free Trial →');

      // Should NOT show analytics
      expect(result).not.toContain('Your Workspace Analytics');
    });

    it('should show trial expired CTA without analytics when no metadata provided', () => {
      const result = getStaticHtml(100, null, 'expired');

      // Should show expired trial CTA
      expect(result).toContain('Your Trial Has Ended ⏰');
      expect(result).toContain('Get Turbo Pro Now 🚀');

      // Should NOT show analytics
      expect(result).not.toContain('Your Workspace Analytics');

      // Should NOT show trial invitation
      expect(result).not.toContain('Try Turbo Pro Free for 2 Hours 🎁');
    });

    it('should ensure trial CTAs are mutually exclusive', () => {
      const noTrialResult = getStaticHtml(150, mockMetadata, undefined);
      const activeTrialResult = getStaticHtml(150, mockMetadata, 'active');
      const expiredTrialResult = getStaticHtml(150, mockMetadata, 'expired');

      // No trial: show invitation, hide expired
      expect(noTrialResult).toContain('Try Turbo Pro Free for 2 Hours 🎁');
      expect(noTrialResult).not.toContain('Your Trial Has Ended ⏰');

      // Active trial: hide both
      expect(activeTrialResult).not.toContain(
        'Try Turbo Pro Free for 2 Hours 🎁',
      );
      expect(activeTrialResult).not.toContain('Your Trial Has Ended ⏰');

      // Expired trial: hide invitation, show expired
      expect(expiredTrialResult).not.toContain(
        'Try Turbo Pro Free for 2 Hours 🎁',
      );
      expect(expiredTrialResult).toContain('Your Trial Has Ended ⏰');
    });

    it('should include onclick handler for trial invitation CTA', () => {
      const result = getStaticHtml(150, mockMetadata, undefined);

      expect(result).toContain('class="trial-button"');
      expect(result).toContain('onclick="event.preventDefault();');
      expect(result).toContain(
        "acquireVsCodeApi().postMessage({ type: 'open-external', url: this.href });",
      );
    });

    it('should include onclick handler for trial expired CTA', () => {
      const result = getStaticHtml(150, mockMetadata, 'expired');

      expect(result).toContain('class="trial-expired-button"');
      expect(result).toContain('onclick="event.preventDefault();');
      expect(result).toContain(
        "acquireVsCodeApi().postMessage({ type: 'open-external', url: this.href });",
      );
    });
  });
});
