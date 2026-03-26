import { getStaticHtml } from '@/pro/TurboProTrialGuidePanel/html/getStaticHtml';

// Mock all dependencies
jest.mock('@/pro/TurboProShowcasePanel/styles/getCommonStyles', () => ({
  getCommonStyles: jest.fn(() => '.container { margin: 0; padding: 20px; }'),
}));

jest.mock('@/pro/TurboProShowcasePanel/javascript/javascript', () => ({
  getJavaScript: jest.fn(() => 'function openUrl(url) { window.open(url); }'),
}));

jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderYouTubeVideoComponent',
  () => ({
    renderYouTubeVideoComponent: jest.fn(),
  }),
);

jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderParagraphComponent',
  () => ({
    renderParagraphComponent: jest.fn(),
  }),
);

jest.mock('@/runTime', () => ({
  isTestMode: jest.fn(() => false),
}));

import { getCommonStyles } from '@/pro/TurboProShowcasePanel/styles/getCommonStyles';
import { getJavaScript } from '@/pro/TurboProShowcasePanel/javascript/javascript';
import { renderYouTubeVideoComponent } from '@/pro/TurboProShowcasePanel/renderers/renderYouTubeVideoComponent';
import { renderParagraphComponent } from '@/pro/TurboProShowcasePanel/renderers/renderParagraphComponent';
import { isTestMode } from '@/runTime';

describe('getStaticHtml (TurboProTrialGuidePanel)', () => {
  let consoleSpy: jest.SpyInstance;

  const mockGetCommonStyles = getCommonStyles as jest.MockedFunction<
    typeof getCommonStyles
  >;
  const mockGetJavaScript = getJavaScript as jest.MockedFunction<
    typeof getJavaScript
  >;
  const mockRenderYouTubeVideoComponent =
    renderYouTubeVideoComponent as jest.MockedFunction<
      typeof renderYouTubeVideoComponent
    >;
  const mockRenderParagraphComponent =
    renderParagraphComponent as jest.MockedFunction<
      typeof renderParagraphComponent
    >;
  const mockIsTestMode = isTestMode as jest.MockedFunction<typeof isTestMode>;

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
    mockIsTestMode.mockReturnValue(false);

    // Mock video components to return unique identifiable HTML
    mockRenderYouTubeVideoComponent.mockImplementation((component) => {
      return `<div class="video-component" data-video-id="${component.youtubeVideoId}">${component.title}</div>`;
    });

    // Mock paragraph component (CTA)
    mockRenderParagraphComponent.mockImplementation((component) => {
      return `<div class="paragraph-component">${component.title}</div>`;
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('basic structure', () => {
    it('should generate complete HTML document', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<head>');
      expect(result).toContain('<body>');
      expect(result).toContain('</html>');
      expect(result).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );
    });

    it('should include common styles in head section', () => {
      const result = getStaticHtml(true);

      expect(result).toContain('<style>');
      expect(result).toContain('.container { margin: 0; padding: 20px; }');
      expect(result).toContain('</style>');
      expect(mockGetCommonStyles).toHaveBeenCalled();
    });

    it('should include JavaScript at the end of document', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('<script>');
      expect(result).toContain('function openUrl(url) { window.open(url); }');
      expect(result).toContain('</script>');
      expect(mockGetJavaScript).toHaveBeenCalled();
    });

    it('should maintain proper HTML structure', () => {
      const result = getStaticHtml(false);

      expect(result.indexOf('<html>')).toBeLessThan(result.indexOf('<head>'));
      expect(result.indexOf('<head>')).toBeLessThan(result.indexOf('<body>'));
      expect(result.indexOf('<body>')).toBeLessThan(
        result.indexOf('<div class="container">'),
      );
      expect(result.indexOf('<script>')).toBeLessThan(
        result.indexOf('</body>'),
      );
      expect(result.indexOf('</body>')).toBeLessThan(result.indexOf('</html>'));
    });
  });

  describe('video rendering', () => {
    it('should render all 4 Pro feature videos', () => {
      getStaticHtml(false);

      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledTimes(4);

      // Video 1: Workspace Navigation
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledWith({
        youtubeVideoId: 'JipCA8lqCIU',
        title: '🌲 Workspace Logs Navigation',
        caption: expect.stringContaining(
          'See all your log statements organized by file and folder',
        ),
      });

      // Video 2: Workspace Cleanup
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledWith({
        youtubeVideoId: '1302jkatcxc',
        title: '🧹 Workspace Logs Cleanup',
        caption: expect.stringContaining(
          'Delete hundreds of logs across dozens of files instantly',
        ),
      });

      // Video 3: Real-Time Filtering
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledWith({
        youtubeVideoId: 'G5Pa5L_Obq4',
        title: '🔍 Workspace Logs Filtering',
        caption: expect.stringContaining('Filter by log type instantly'),
      });

      // Video 4: Instant Search
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledWith({
        youtubeVideoId: 'xggQvZimMSk',
        title: '🔎 Workspace Logs Search',
        caption: expect.stringContaining('Find any log by content in seconds'),
      });
    });

    it('should include all video components in HTML output', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('data-video-id="JipCA8lqCIU"');
      expect(result).toContain('data-video-id="1302jkatcxc"');
      expect(result).toContain('data-video-id="G5Pa5L_Obq4"');
      expect(result).toContain('data-video-id="xggQvZimMSk"');
    });

    it('should render videos in correct order', () => {
      const result = getStaticHtml(false);

      const video1Index = result.indexOf('data-video-id="JipCA8lqCIU"');
      const video2Index = result.indexOf('data-video-id="1302jkatcxc"');
      const video3Index = result.indexOf('data-video-id="G5Pa5L_Obq4"');
      const video4Index = result.indexOf('data-video-id="xggQvZimMSk"');

      expect(video1Index).toBeLessThan(video2Index);
      expect(video2Index).toBeLessThan(video3Index);
      expect(video3Index).toBeLessThan(video4Index);
    });
  });

  describe('CTA conditional rendering', () => {
    it('should render CTA when shouldHideCta is false (freemium users)', () => {
      const result = getStaticHtml(false);

      expect(mockRenderParagraphComponent).toHaveBeenCalledWith({
        title: '🚀 Ready to unlock these Pro features?',
        rawHtml: true,
        content: expect.stringContaining('Get lifetime access to Turbo Pro'),
      });

      expect(result).toContain('paragraph-component');
    });

    it('should NOT render CTA when shouldHideCta is true (trial or Pro users)', () => {
      const result = getStaticHtml(true);

      expect(mockRenderParagraphComponent).not.toHaveBeenCalled();
      expect(result).not.toContain('paragraph-component');
    });

    it('should position CTA between video 2 and video 3', () => {
      const result = getStaticHtml(false);

      const video2Index = result.indexOf('data-video-id="1302jkatcxc"');
      const ctaIndex = result.indexOf('paragraph-component');
      const video3Index = result.indexOf('data-video-id="G5Pa5L_Obq4"');

      expect(video2Index).toBeLessThan(ctaIndex);
      expect(ctaIndex).toBeLessThan(video3Index);
    });
  });

  describe('CTA content', () => {
    it('should include correct CTA title for freemium users', () => {
      getStaticHtml(false);

      expect(mockRenderParagraphComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '🚀 Ready to unlock these Pro features?',
        }),
      );
    });

    it('should include Pro CTA message without trial mention for freemium users', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      expect(callArg.content).toContain('Get lifetime access to Turbo Pro');
      expect(callArg.content).toContain('supercharge your debugging workflow');
      expect(callArg.content).not.toContain('trial');
      expect(callArg.content).not.toContain('2 hours');
    });

    it('should include correct CTA button text', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      expect(callArg.content).toContain('Get Turbo Pro →');
    });

    it('should include CTA details with guarantees', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      expect(callArg.content).toContain('One-time purchase');
      expect(callArg.content).toContain('Lifetime access');
      expect(callArg.content).toContain('30-day money-back guarantee');
    });

    it('should include tracking parameters in CTA URL', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      expect(callArg.content).toContain('utm_source=features-guide');
      expect(callArg.content).toContain('utm_campaign=mid-guide-cta');
      expect(callArg.content).toContain('utm_medium=panel');
    });

    it('should include turboconsolelog.io domain in CTA URL', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      // URL is determined at module load time based on isTestMode()
      // In test environment, it should use the appropriate base URL
      expect(callArg.content).toMatch(/turboconsolelog\.io|localhost:3000/);
      expect(callArg.content).toContain('/pro?utm_source=features-guide');
    });

    it('should include click tracking in CTA button', () => {
      getStaticHtml(false);

      const callArg = mockRenderParagraphComponent.mock.calls[0][0];
      expect(callArg.content).toContain('onclick="openUrlWithTracking');
      expect(callArg.content).toContain("'pro-showcase-cta'");
      expect(callArg.content).toContain("'Get Turbo Pro'");
    });
  });

  describe('custom styles', () => {
    it('should include CTA banner styles', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('.pro-showcase-cta-banner');
      expect(result).toContain('background: linear-gradient');
      expect(result).toContain('border: 2px solid #667EEA');
    });

    it('should include CTA button styles with gradient', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('.cta-button');
      expect(result).toContain(
        'background: linear-gradient(135deg, #667EEA, #764BA2)',
      );
    });

    it('should include hover effects for CTA button', () => {
      const result = getStaticHtml(false);

      expect(result).toContain('.cta-button:hover');
      expect(result).toContain('transform: translateY(-2px)');
    });

    it('should include CTA message styles with gold accent', () => {
      const result = getStaticHtml(true);

      expect(result).toContain('.cta-message strong');
      expect(result).toContain('color: #FFC947');
    });
  });

  describe('edge cases', () => {
    it('should handle custom common styles', () => {
      mockGetCommonStyles.mockReturnValue('.custom { color: blue; }');

      const result = getStaticHtml(false);

      expect(result).toContain('.custom { color: blue; }');
    });

    it('should handle custom JavaScript', () => {
      mockGetJavaScript.mockReturnValue('console.log("Custom");');

      const result = getStaticHtml(true);

      expect(result).toContain('console.log("Custom");');
    });

    it('should always render 4 videos regardless of shouldHideCta value', () => {
      // shouldHideCta = true (hide CTA)
      getStaticHtml(true);
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledTimes(4);

      jest.clearAllMocks();

      // shouldHideCta = false (show CTA)
      getStaticHtml(false);
      expect(mockRenderYouTubeVideoComponent).toHaveBeenCalledTimes(4);
    });

    it('should handle multiple consecutive calls with different shouldHideCta values', () => {
      // First call - no trial
      const result1 = getStaticHtml(false);
      expect(result1).toContain('paragraph-component');

      // Second call - active trial
      const result2 = getStaticHtml(true);
      expect(result2).not.toContain('paragraph-component');

      // Third call - no trial again
      const result3 = getStaticHtml(false);
      expect(result3).toContain('paragraph-component');
    });
  });

  describe('accessibility and metadata', () => {
    it('should include viewport meta tag for responsive design', () => {
      const result = getStaticHtml(false);

      expect(result).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );
    });

    it('should use semantic HTML structure', () => {
      const result = getStaticHtml(true);

      expect(result).toContain('<div class="container">');
    });

    it('should ensure proper DOCTYPE declaration', () => {
      const result = getStaticHtml(false);

      expect(result.trim().startsWith('<!DOCTYPE html>')).toBe(true);
    });
  });
});
