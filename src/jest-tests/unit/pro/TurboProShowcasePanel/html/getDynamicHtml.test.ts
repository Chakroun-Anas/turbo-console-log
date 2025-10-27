import { getDynamicHtml } from '@/pro/TurboProShowcasePanel/html/getDynamicHtml';
import { DynamicFreemiumPanel } from '@/pro/TurboProShowcasePanel/types';

// Helper to create valid DynamicFreemiumPanel
const createMockDynamicPanel = (
  contentOverrides: Partial<DynamicFreemiumPanel> = {},
): DynamicFreemiumPanel => ({
  tooltip: 'Test tooltip',
  date: new Date(),
  content: [],
  ...contentOverrides,
});

// Mock all dependencies
jest.mock('@/pro/TurboProShowcasePanel/contentByType', () => ({
  contentByType: jest.fn(() => ({
    topContentHtml: '<div class="top-content">Top Content</div>',
    articlesHtml: '<div class="articles">Articles</div>',
    surveyHtml: '',
    tableHtml: '',
    mediaShowcaseCTAHtml: '',
  })),
}));

jest.mock('@/pro/TurboProShowcasePanel/styles/getCommonStyles', () => ({
  getCommonStyles: jest.fn(() => '.container { margin: 0; }'),
}));

jest.mock('@/pro/TurboProShowcasePanel/javascript/javascript', () => ({
  getJavaScript: jest.fn(() => 'function openUrl(url) { console.log(url); }'),
}));

import { contentByType } from '@/pro/TurboProShowcasePanel/contentByType';
import { getCommonStyles } from '@/pro/TurboProShowcasePanel/styles/getCommonStyles';
import { getJavaScript } from '@/pro/TurboProShowcasePanel/javascript/javascript';

describe('getDynamicHtml', () => {
  let consoleSpy: jest.SpyInstance;

  const mockContentByType = contentByType as jest.MockedFunction<
    typeof contentByType
  >;
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
    mockContentByType.mockReturnValue({
      topContentHtml: '<div class="top-content">Top Content</div>',
      articlesHtml: '<div class="articles">Articles</div>',
      surveyHtml: '<div class="survey">Survey</div>',
      tableHtml: '<div class="table">Table</div>',
      mediaShowcaseCTAHtml: '',
    });
    mockGetCommonStyles.mockReturnValue('.container { margin: 0; }');
    mockGetJavaScript.mockReturnValue(
      'function openUrl(url) { console.log(url); }',
    );
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should generate complete HTML document with all sections', () => {
    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');
    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  });

  it('should call contentByType with provided dynamic content', () => {
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: new Date(),
      content: [
        {
          type: 'paragraph',
          component: {
            title: 'Test Title',
            content: 'Test Description',
          },
        },
      ],
    };

    getDynamicHtml(dynamicContent);

    expect(mockContentByType).toHaveBeenCalledWith(dynamicContent);
  });

  it('should include all content sections in correct order', () => {
    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    const topContentIndex = result.indexOf(
      '<div class="top-content">Top Content</div>',
    );
    const articlesIndex = result.indexOf(
      '<div class="articles">Articles</div>',
    );

    // Verify order: top content, then articles
    expect(topContentIndex).toBeGreaterThan(-1);
    expect(articlesIndex).toBeGreaterThan(-1);
    expect(topContentIndex).toBeLessThan(articlesIndex);
  });

  it('should include common styles in head section', () => {
    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    expect(result).toContain('<style>');
    expect(result).toContain('.container { margin: 0; }');
    expect(result).toContain('</style>');
    expect(mockGetCommonStyles).toHaveBeenCalled();
  });

  it('should include JavaScript at the end of document', () => {
    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    expect(result).toContain('<script>');
    expect(result).toContain('function openUrl(url) { console.log(url); }');
    expect(result).toContain('</script>');
    expect(mockGetJavaScript).toHaveBeenCalled();
  });

  it('should handle empty content gracefully', () => {
    mockContentByType.mockReturnValue({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });

    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    expect(result).toContain('<html>');
    expect(result).toContain('</html>');
    expect(result).toContain('<div class="container">');
    // Should still have proper HTML structure even with empty content
  });

  it('should maintain proper HTML structure', () => {
    const dynamicContent = createMockDynamicPanel();

    const result = getDynamicHtml(dynamicContent);

    // Check structure order
    expect(result.indexOf('<html>')).toBeLessThan(result.indexOf('<head>'));
    expect(result.indexOf('<head>')).toBeLessThan(result.indexOf('<body>'));
    expect(result.indexOf('<body>')).toBeLessThan(
      result.indexOf('<div class="container">'),
    );
    expect(result.indexOf('<script>')).toBeLessThan(result.indexOf('</body>'));
    expect(result.indexOf('</body>')).toBeLessThan(result.indexOf('</html>'));
  });

  it('should handle complex dynamic content', () => {
    mockContentByType.mockReturnValue({
      topContentHtml:
        '<div>Complex top content with <strong>HTML</strong></div>',
      articlesHtml:
        '<article><h2>Article Title</h2><p>Article content</p></article>',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });

    const dynamicContent = createMockDynamicPanel({
      content: [
        { type: 'paragraph', component: { title: 'Test', content: 'Test' } },
        {
          type: 'table',
          component: { title: 'Table', columns: ['Col1'], rows: [] },
        },
      ],
    });

    const result = getDynamicHtml(dynamicContent);

    expect(result).toContain('Complex top content with <strong>HTML</strong>');
    expect(result).toContain('<article><h2>Article Title</h2>');
  });
});
