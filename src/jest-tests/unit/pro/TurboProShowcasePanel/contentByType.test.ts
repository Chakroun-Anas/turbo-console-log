import { contentByType } from '@/pro/TurboProShowcasePanel/contentByType';
import {
  DynamicFreemiumPanel,
  DynamicFreemiumPanelContent,
  ParagraphPanelComponent,
  ArticlePanelComponent,
  CountDownPanelComponent,
  SurveyPanelComponent,
  TablePanelComponent,
  MediaShowcaseCTAPanelComponent,
} from '@/pro/TurboProShowcasePanel/types';

// Mock the renderContentItem function
jest.mock('@/pro/TurboProShowcasePanel/renderers/renderContentItem', () => ({
  renderContentItem: jest.fn(),
}));

import { renderContentItem } from '@/pro/TurboProShowcasePanel/renderers/renderContentItem';
const mockRenderContentItem = renderContentItem as jest.MockedFunction<
  typeof renderContentItem
>;

describe('contentByType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty content when dynamicContent is undefined', () => {
    const result = contentByType(undefined);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should return empty content when content array is empty', () => {
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content: [],
    };

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should return empty content when content array is missing', () => {
    const dynamicContent = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
    } as DynamicFreemiumPanel;

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should separate paragraph content to topContentHtml', () => {
    const paragraphComponent: ParagraphPanelComponent = {
      title: 'Test Title',
      content: 'Test content',
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'paragraph', component: paragraphComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<p>Paragraph content</p>');

    const result = contentByType(dynamicContent);

    expect(mockRenderContentItem).toHaveBeenCalledWith(content[0]);
    expect(result).toEqual({
      topContentHtml: '<p>Paragraph content</p>',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should separate article content to articlesHtml', () => {
    const articleComponent: ArticlePanelComponent = {
      title: 'Test Article',
      description: 'Article description',
      illustrationSrc: 'https://example.com/image.jpg',
      url: 'https://example.com/test-article',
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'article', component: articleComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<article>Article content</article>');

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '<article>Article content</article>',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should separate survey content to surveyHtml', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'User Survey',
      description: 'Help us improve',
      CTA: { text: 'Take Survey', url: 'https://survey.com' },
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'survey', component: surveyComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<div>Survey content</div>');

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '<div>Survey content</div>',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should separate table content to tableHtml', () => {
    const tableComponent: TablePanelComponent = {
      title: 'Shortcuts',
      columns: ['Description', 'macOS'],
      rows: [{ Description: 'Insert log', macOS: 'Cmd+L' }],
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'table', component: tableComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<table>Table content</table>');

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '<table>Table content</table>',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should handle countdown content as topContentHtml', () => {
    const countdownComponent: CountDownPanelComponent = {
      eventName: 'New Year',
      targetDateUTC: '2025-12-31T23:59:59Z',
      illustrationSrc: 'https://example.com/countdown.jpg',
      CTA: { text: 'Learn More', url: 'https://example.com' },
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'countdown', component: countdownComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<div>Countdown content</div>');

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '<div>Countdown content</div>',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should separate media showcase CTA content to mediaShowcaseCTAHtml', () => {
    const mediaShowcaseComponent: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ],
      cta: {
        text: 'Learn More',
        url: 'https://example.com/feature',
      },
    };
    const content: DynamicFreemiumPanelContent[] = [
      { type: 'media-showcase-cta', component: mediaShowcaseComponent },
    ];
    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem.mockReturnValue('<div>Media showcase content</div>');

    const result = contentByType(dynamicContent);

    expect(result).toEqual({
      topContentHtml: '',
      articlesHtml: '',
      surveyHtml: '',
      tableHtml: '',
      mediaShowcaseCTAHtml: '<div>Media showcase content</div>',
    });
  });

  it('should handle mixed content types', () => {
    const paragraphComponent: ParagraphPanelComponent = {
      title: 'Paragraph Title',
      content: 'Paragraph content',
    };
    const articleComponent: ArticlePanelComponent = {
      title: 'Article Title',
      description: 'Article description',
      illustrationSrc: 'https://example.com/image.jpg',
      url: 'https://example.com/article',
    };
    const surveyComponent: SurveyPanelComponent = {
      title: 'Survey Title',
      description: 'Survey description',
      CTA: { text: 'Take Survey', url: 'https://survey.com' },
    };
    const tableComponent: TablePanelComponent = {
      title: 'Table Title',
      columns: ['Col1', 'Col2'],
      rows: [{ Col1: 'Value1', Col2: 'Value2' }],
    };

    const content: DynamicFreemiumPanelContent[] = [
      { type: 'paragraph', component: paragraphComponent },
      { type: 'article', component: articleComponent },
      { type: 'survey', component: surveyComponent },
      { type: 'table', component: tableComponent },
    ];

    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem
      .mockReturnValueOnce('<p>Paragraph</p>')
      .mockReturnValueOnce('<article>Article</article>')
      .mockReturnValueOnce('<div>Survey</div>')
      .mockReturnValueOnce('<table>Table</table>');

    const result = contentByType(dynamicContent);

    expect(mockRenderContentItem).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      topContentHtml: '<p>Paragraph</p>',
      articlesHtml: '<article>Article</article>',
      surveyHtml: '<div>Survey</div>',
      tableHtml: '<table>Table</table>',
      mediaShowcaseCTAHtml: '',
    });
  });

  it('should accumulate multiple items of same type', () => {
    const article1: ArticlePanelComponent = {
      title: 'Article 1',
      description: 'First article',
      illustrationSrc: 'https://example.com/1.jpg',
      url: 'https://example.com/article1',
    };
    const article2: ArticlePanelComponent = {
      title: 'Article 2',
      description: 'Second article',
      illustrationSrc: 'https://example.com/2.jpg',
      url: 'https://example.com/article2',
    };

    const content: DynamicFreemiumPanelContent[] = [
      { type: 'article', component: article1 },
      { type: 'article', component: article2 },
    ];

    const dynamicContent: DynamicFreemiumPanel = {
      tooltip: 'Test tooltip',
      date: '2025-09-27',
      content,
    };

    mockRenderContentItem
      .mockReturnValueOnce('<article>Article 1</article>')
      .mockReturnValueOnce('<article>Article 2</article>');

    const result = contentByType(dynamicContent);

    expect(result.articlesHtml).toBe(
      '<article>Article 1</article><article>Article 2</article>',
    );
  });
});
