import { renderContentItem } from '@/pro/TurboProShowcasePanel/renderers/renderContentItem';
import {
  DynamicFreemiumPanelContent,
  ParagraphPanelComponent,
  ArticlePanelComponent,
  CountDownPanelComponent,
  SurveyPanelComponent,
  TablePanelComponent,
} from '@/pro/TurboProShowcasePanel/types';

// Mock all the renderer functions to focus on the dispatch logic
jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderParagraphComponent',
  () => ({
    renderParagraphComponent: jest.fn(),
  }),
);
jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderArticleComponent',
  () => ({
    renderArticleComponent: jest.fn(),
  }),
);
jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderCountDownComponent',
  () => ({
    renderCountDownComponent: jest.fn(),
  }),
);
jest.mock(
  '@/pro/TurboProShowcasePanel/renderers/renderSurveyComponent',
  () => ({
    renderSurveyComponent: jest.fn(),
  }),
);
jest.mock('@/pro/TurboProShowcasePanel/renderers/renderTableComponent', () => ({
  renderTableComponent: jest.fn(),
}));

import { renderParagraphComponent } from '@/pro/TurboProShowcasePanel/renderers/renderParagraphComponent';
import { renderArticleComponent } from '@/pro/TurboProShowcasePanel/renderers/renderArticleComponent';
import { renderCountDownComponent } from '@/pro/TurboProShowcasePanel/renderers/renderCountDownComponent';
import { renderSurveyComponent } from '@/pro/TurboProShowcasePanel/renderers/renderSurveyComponent';
import { renderTableComponent } from '@/pro/TurboProShowcasePanel/renderers/renderTableComponent';

const mockRenderParagraphComponent =
  renderParagraphComponent as jest.MockedFunction<
    typeof renderParagraphComponent
  >;
const mockRenderArticleComponent =
  renderArticleComponent as jest.MockedFunction<typeof renderArticleComponent>;
const mockRenderCountDownComponent =
  renderCountDownComponent as jest.MockedFunction<
    typeof renderCountDownComponent
  >;
const mockRenderSurveyComponent = renderSurveyComponent as jest.MockedFunction<
  typeof renderSurveyComponent
>;
const mockRenderTableComponent = renderTableComponent as jest.MockedFunction<
  typeof renderTableComponent
>;

describe('renderContentItem', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should render paragraph component', () => {
    const component: ParagraphPanelComponent = {
      title: 'Test Title',
      content: 'Test paragraph content',
    };
    const content: DynamicFreemiumPanelContent = {
      type: 'paragraph',
      component,
    };

    mockRenderParagraphComponent.mockReturnValue('<p>Test paragraph</p>');

    const result = renderContentItem(content);

    expect(mockRenderParagraphComponent).toHaveBeenCalledWith(component);
    expect(result).toBe('<p>Test paragraph</p>');
  });

  it('should render article component', () => {
    const component: ArticlePanelComponent = {
      title: 'Test Article',
      description: 'Article description',
      illustrationSrc: 'https://example.com/image.jpg',
    };
    const content: DynamicFreemiumPanelContent = { type: 'article', component };

    mockRenderArticleComponent.mockReturnValue(
      '<article>Test Article</article>',
    );

    const result = renderContentItem(content);

    expect(mockRenderArticleComponent).toHaveBeenCalledWith(component);
    expect(result).toBe('<article>Test Article</article>');
  });

  it('should render countdown component', () => {
    const component: CountDownPanelComponent = {
      eventName: 'New Year Event',
      targetDateUTC: '2025-12-31T23:59:59Z',
      illustrationSrc: 'https://example.com/countdown.jpg',
      CTA: { text: 'Learn More', url: 'https://example.com' },
    };
    const content: DynamicFreemiumPanelContent = {
      type: 'countdown',
      component,
    };

    mockRenderCountDownComponent.mockReturnValue('<div>Countdown</div>');

    const result = renderContentItem(content);

    expect(mockRenderCountDownComponent).toHaveBeenCalledWith(component);
    expect(result).toBe('<div>Countdown</div>');
  });

  it('should render survey component', () => {
    const component: SurveyPanelComponent = {
      title: 'User Survey',
      description: 'Help us improve',
      CTA: { text: 'Take Survey', url: 'https://survey.com' },
    };
    const content: DynamicFreemiumPanelContent = { type: 'survey', component };

    mockRenderSurveyComponent.mockReturnValue('<div>Survey</div>');

    const result = renderContentItem(content);

    expect(mockRenderSurveyComponent).toHaveBeenCalledWith(component);
    expect(result).toBe('<div>Survey</div>');
  });

  it('should render table component', () => {
    const component: TablePanelComponent = {
      title: 'Shortcuts',
      columns: ['Description', 'macOS', 'Windows'],
      rows: [{ Description: 'Insert log', macOS: 'Cmd+L', Windows: 'Ctrl+L' }],
    };
    const content: DynamicFreemiumPanelContent = { type: 'table', component };

    mockRenderTableComponent.mockReturnValue('<table>Commands</table>');

    const result = renderContentItem(content);

    expect(mockRenderTableComponent).toHaveBeenCalledWith(component);
    expect(result).toBe('<table>Commands</table>');
  });

  it('should handle unknown content type gracefully', () => {
    const unknownContent = {
      type: 'unknown',
      component: { data: 'test' },
    } as unknown as DynamicFreemiumPanelContent;

    const result = renderContentItem(unknownContent);

    expect(result).toBe('');
    // No console logging expected - function returns empty string silently
  });

  it('should not call any renderer for unknown type', () => {
    const unknownContent = {
      type: 'invalid',
      component: {},
    } as unknown as DynamicFreemiumPanelContent;

    renderContentItem(unknownContent);

    expect(mockRenderParagraphComponent).not.toHaveBeenCalled();
    expect(mockRenderArticleComponent).not.toHaveBeenCalled();
    expect(mockRenderCountDownComponent).not.toHaveBeenCalled();
    expect(mockRenderSurveyComponent).not.toHaveBeenCalled();
    expect(mockRenderTableComponent).not.toHaveBeenCalled();
  });
});
