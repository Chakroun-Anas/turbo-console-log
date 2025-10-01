import { renderArticleComponent } from '@/pro/TurboProShowcasePanel/renderers/renderArticleComponent';
import { ArticlePanelComponent } from '@/pro/TurboProShowcasePanel/types';

// Mock the escapeHtml dependency
jest.mock('@/pro/TurboProShowcasePanel/renderers/escapeHtml', () => ({
  escapeHtml: jest.fn((text: string) =>
    text.replace(/[<>&"]/g, (match) => {
      switch (match) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case '"':
          return '&quot;';
        default:
          return match;
      }
    }),
  ),
}));

describe('renderArticleComponent', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should render article component with all properties', () => {
    const articleComponent: ArticlePanelComponent = {
      title:
        'Long Article Title That Should Be Properly Rendered Without Issues',
      description:
        'This is a very long description that contains multiple sentences and should be handled properly by the renderer function without any truncation or formatting issues.',
      illustrationSrc: 'https://example.com/very-long-image-path.png',
      url: 'https://example.com/long-article',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('class="article-card"');
    expect(result).toContain(
      'Long Article Title That Should Be Properly Rendered Without Issues',
    );
    expect(result).toContain(
      'This is a very long description that contains multiple sentences',
    );
    expect(result).toContain('https://example.com/very-long-image-path.png');
    expect(result).toContain('class="article-image"');
    expect(result).toContain('class="article-title"');
    expect(result).toContain('class="article-desc"');
  });

  it('should include onclick handler with correct URL', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Test Article',
      description: 'Test description',
      illustrationSrc: 'test-image.png',
      url: 'https://example.com/test-article',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://example.com/test-article', 'article', 'Test Article')\"",
    );
  });

  it('should properly escape HTML in all text fields', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Article with <script>alert("xss")</script>',
      description: 'Description with <img src=x onerror=alert(1)>',
      illustrationSrc: 'javascript:alert("xss")',
      url: 'javascript:alert("xss")',
    };

    const result = renderArticleComponent(articleComponent);

    // Verify HTML is escaped (our mock replaces dangerous characters)
    expect(result).toContain(
      'Article with &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
    expect(result).toContain(
      'Description with &lt;img src=x onerror=alert(1)&gt;',
    );
    expect(result).toContain('javascript:alert(&quot;xss&quot;)');
  });

  it('should handle empty strings gracefully', () => {
    const articleComponent: ArticlePanelComponent = {
      title: '',
      description: '',
      illustrationSrc: '',
      url: '',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('class="article-card"');
    expect(result).toContain('class="article-image"');
    expect(result).toContain('src=""');
    expect(result).toContain('alt=""');
  });

  it('should maintain proper HTML structure', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Test Title with "quotes"',
      description: 'Test description with "quotes"',
      illustrationSrc: 'test.png',
      url: 'https://example.com/test-quotes',
    };

    const result = renderArticleComponent(articleComponent);

    // Check for proper nesting structure
    expect(result.indexOf('<div class="article-card"')).toBeLessThan(
      result.indexOf('<img'),
    );
    expect(result.indexOf('<img')).toBeLessThan(
      result.indexOf('<div class="article-title"'),
    );
    expect(result.indexOf('<div class="article-title"')).toBeLessThan(
      result.indexOf('<div class="article-desc"'),
    );
  });

  it('should use alt attribute with escaped title', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Title with "quotes"',
      description: 'Description',
      illustrationSrc: 'image.png',
      url: 'https://example.com/test',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('alt="Title with &quot;quotes&quot;"');
  });
});
