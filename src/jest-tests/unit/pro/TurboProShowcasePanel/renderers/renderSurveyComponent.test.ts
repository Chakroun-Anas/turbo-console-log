import { renderSurveyComponent } from '@/pro/TurboProShowcasePanel/renderers/renderSurveyComponent';
import { SurveyPanelComponent } from '@/pro/TurboProShowcasePanel/types';

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

describe('renderSurveyComponent', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should render survey component with all properties', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'User Experience Survey',
      description: 'Help us improve Turbo Console Log by sharing your feedback',
      CTA: {
        text: 'Take Survey',
        url: 'https://survey.turboconsolelog.io/feedback',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain('class="survey-section"');
    expect(result).toContain('<h3>User Experience Survey</h3>');
    expect(result).toContain(
      '<p>Help us improve Turbo Console Log by sharing your feedback</p>',
    );
    expect(result).toContain('class="survey-cta"');
    expect(result).toContain('Take Survey');
  });

  it('should include onclick handler with correct URL and return false', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Test Survey',
      description: 'Test description',
      CTA: {
        text: 'Click Here',
        url: 'https://example.com/survey',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://example.com/survey', 'survey', 'Click Here'); return false;\"",
    );
    expect(result).toContain('style="cursor: pointer;"');
  });

  it('should properly escape HTML in all text fields', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Survey with <script>alert("xss")</script>',
      description: 'Description with "quotes" & <tags>',
      CTA: {
        text: 'CTA with <span>HTML</span>',
        url: 'https://example.com?param=<value>&other="test"',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    // Verify HTML is escaped (our mock replaces dangerous characters)
    expect(result).toContain('Survey with &lt;script&gt;');
    expect(result).toContain(
      'Description with &quot;quotes&quot; &amp; &lt;tags&gt;',
    );
    expect(result).toContain('CTA with &lt;span&gt;HTML&lt;/span&gt;');
    expect(result).toContain(
      'https://example.com?param=&lt;value&gt;&amp;other=&quot;test&quot;',
    );
  });

  it('should handle empty strings gracefully', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: '',
      description: '',
      CTA: {
        text: '',
        url: '',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain('class="survey-section"');
    expect(result).toContain('<h3></h3>');
    expect(result).toContain('<p></p>');
    expect(result).toContain('class="survey-cta"');
    expect(result).toContain(
      "onclick=\"openUrlWithTracking('', 'survey', ''); return false;\"",
    );
  });

  it('should maintain proper HTML structure', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Test Title',
      description: 'Test Description',
      CTA: {
        text: 'Test CTA',
        url: 'https://test.com',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    // Check for proper nesting structure
    expect(result.indexOf('<section')).toBeLessThan(result.indexOf('<h3>'));
    expect(result.indexOf('<h3>')).toBeLessThan(result.indexOf('<p>'));
    expect(result.indexOf('<p>')).toBeLessThan(
      result.indexOf('<a class="survey-cta"'),
    );
  });

  it('should handle special characters in URL', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Survey',
      description: 'Description',
      CTA: {
        text: 'Take Survey',
        url: 'https://survey.com/form?utm_source=extension&utm_medium=panel',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://survey.com/form?utm_source=extension&amp;utm_medium=panel', 'survey', 'Take Survey'); return false;\"",
    );
  });

  it('should apply cursor pointer style to CTA', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Survey',
      description: 'Description',
      CTA: {
        text: 'Click',
        url: 'https://test.com',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain('style="cursor: pointer;"');
  });

  it('should handle multiline descriptions', () => {
    const surveyComponent: SurveyPanelComponent = {
      title: 'Survey',
      description: 'Line 1\nLine 2\nLine 3',
      CTA: {
        text: 'Submit',
        url: 'https://test.com',
      },
    };

    const result = renderSurveyComponent(surveyComponent);

    expect(result).toContain('Line 1\nLine 2\nLine 3');
  });
});
