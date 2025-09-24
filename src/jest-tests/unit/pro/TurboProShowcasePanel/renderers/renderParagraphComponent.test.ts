import { renderParagraphComponent } from '@/pro/TurboProShowcasePanel/renderers/renderParagraphComponent';
import { ParagraphPanelComponent } from '@/pro/TurboProShowcasePanel/types';

// Mock escapeHtml to focus on component logic
jest.mock('@/pro/TurboProShowcasePanel/renderers/escapeHtml', () => ({
  escapeHtml: jest.fn((text: string) => text), // Return text as-is for testing
}));

import { escapeHtml } from '@/pro/TurboProShowcasePanel/renderers/escapeHtml';
const mockEscapeHtml = escapeHtml as jest.MockedFunction<typeof escapeHtml>;

describe('renderParagraphComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEscapeHtml.mockImplementation((text: string) => text);
  });

  it('should render a basic paragraph component', () => {
    const component: ParagraphPanelComponent = {
      title: 'Test Title',
      content: 'Test content',
    };

    const result = renderParagraphComponent(component);

    expect(result).toContain('<div class="dynamic-content">');
    expect(result).toContain('<h3>Test Title</h3>');
    expect(result).toContain('<p>Test content</p>');
    expect(result).toContain('</div>');
  });

  it('should escape title and content using escapeHtml', () => {
    const component: ParagraphPanelComponent = {
      title: 'Title with <script>',
      content: 'Content with "quotes"',
    };

    mockEscapeHtml.mockImplementation((text: string) => `escaped:${text}`);

    const result = renderParagraphComponent(component);

    expect(mockEscapeHtml).toHaveBeenCalledWith('Title with <script>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Content with "quotes"');
    expect(result).toContain('<h3>escaped:Title with <script></h3>');
    expect(result).toContain('<p>escaped:Content with "quotes"</p>');
  });

  it('should handle empty title and content', () => {
    const component: ParagraphPanelComponent = {
      title: '',
      content: '',
    };

    const result = renderParagraphComponent(component);

    expect(result).toContain('<h3></h3>');
    expect(result).toContain('<p></p>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('');
  });

  it('should maintain HTML structure', () => {
    const component: ParagraphPanelComponent = {
      title: 'Title',
      content: 'Content',
    };

    const result = renderParagraphComponent(component);

    // Verify proper HTML structure
    expect(result.indexOf('<div class="dynamic-content">')).toBeLessThan(
      result.indexOf('<h3>'),
    );
    expect(result.indexOf('<h3>')).toBeLessThan(result.indexOf('<p>'));
    expect(result.indexOf('<p>')).toBeLessThan(result.lastIndexOf('</div>'));
  });
});
