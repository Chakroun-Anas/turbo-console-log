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
      title: 'Advanced AST Engine',
      description:
        'Learn about the new AST-powered engine for precise code detection',
      illustrationSrc: 'https://example.com/ast-image.png',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('class="article-card"');
    expect(result).toContain('Advanced AST Engine');
    expect(result).toContain('Learn about the new AST-powered engine');
    expect(result).toContain('https://example.com/ast-image.png');
    expect(result).toContain('class="article-image"');
    expect(result).toContain('class="article-title"');
    expect(result).toContain('class="article-desc"');
  });

  it('should include onclick handler with correct URL', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Test Article',
      description: 'Test description',
      illustrationSrc: 'test-image.png',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://www.turboconsolelog.io/articles/turbo-full-ast-engine', 'article', 'Test Article')\"",
    );
  });

  it('should properly escape HTML in all text fields', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Title with <script>alert("xss")</script>',
      description: 'Description with "quotes" & <tags>',
      illustrationSrc: 'image.png?param=value&other=<test>',
    };

    const result = renderArticleComponent(articleComponent);

    // Verify HTML is escaped (our mock replaces dangerous characters)
    expect(result).toContain('Title with &lt;script&gt;');
    expect(result).toContain(
      'Description with &quot;quotes&quot; &amp; &lt;tags&gt;',
    );
    expect(result).toContain('image.png?param=value&amp;other=&lt;test&gt;');
  });

  it('should handle empty strings gracefully', () => {
    const articleComponent: ArticlePanelComponent = {
      title: '',
      description: '',
      illustrationSrc: '',
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('class="article-card"');
    expect(result).toContain('class="article-image"');
    expect(result).toContain('src=""');
    expect(result).toContain('alt=""');
  });

  it('should maintain proper HTML structure', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Test Title',
      description: 'Test Description',
      illustrationSrc: 'test.png',
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
    };

    const result = renderArticleComponent(articleComponent);

    expect(result).toContain('alt="Title with &quot;quotes&quot;"');
  });
});
