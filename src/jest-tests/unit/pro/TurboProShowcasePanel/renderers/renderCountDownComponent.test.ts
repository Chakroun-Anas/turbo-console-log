import { renderCountDownComponent } from '@/pro/TurboProShowcasePanel/renderers/renderCountDownComponent';
import { CountDownPanelComponent } from '@/pro/TurboProShowcasePanel/types';

// Mock escapeHtml to focus on component logic
jest.mock('@/pro/TurboProShowcasePanel/renderers/escapeHtml', () => ({
  escapeHtml: jest.fn((text: string) => text), // Return text as-is for testing
}));

import { escapeHtml } from '@/pro/TurboProShowcasePanel/renderers/escapeHtml';
const mockEscapeHtml = escapeHtml as jest.MockedFunction<typeof escapeHtml>;

describe('renderCountDownComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEscapeHtml.mockImplementation((text: string) => text);
  });

  it('should render countdown for future date', () => {
    // Use a date far in the future to ensure it's always future
    const component: CountDownPanelComponent = {
      eventName: 'New Year Celebration',
      targetDateUTC: '2030-12-31T23:59:59Z', // Far future date
      illustrationSrc: 'turbo-2026-celebration-wide-no-text.png',
      CTA: {
        text: 'Learn More',
        url: 'https://example.com',
      },
    };

    const result = renderCountDownComponent(component);

    expect(result).toContain('class="countdown-widget"');
    expect(result).toContain('New Year Celebration');
    expect(result).toContain('Days');
    expect(result).toContain('Hours');
    expect(result).toContain('Minutes');
    expect(result).toContain('Seconds');
    expect(result).toContain('Learn More');

    // Verify escaping calls
    expect(mockEscapeHtml).toHaveBeenCalledWith('New Year Celebration');
    expect(mockEscapeHtml).toHaveBeenCalledWith(
      'turbo-2026-celebration-wide-no-text.png',
    );
    expect(mockEscapeHtml).toHaveBeenCalledWith('Learn More');
    expect(mockEscapeHtml).toHaveBeenCalledWith('https://example.com');
  });

  it('should return empty string for past date', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Past Event',
      targetDateUTC: '2020-01-01T00:00:00Z', // Definitely past date
      illustrationSrc:
        'https://www.turboconsolelog.io/assets/turbo-past-event.png',
      CTA: {
        text: 'View Details',
        url: 'https://example.com',
      },
    };

    const result = renderCountDownComponent(component);

    expect(result).toBe('');
  });

  it('should include countdown structure for future date', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Test Event',
      targetDateUTC: '2030-12-31T00:00:00Z', // Far future
      illustrationSrc: 'turbo-test-event.png',
      CTA: {
        text: 'Test CTA',
        url: 'https://test.com',
      },
    };

    const result = renderCountDownComponent(component);

    // Should contain the countdown structure
    expect(result).toMatch(/countdown-number">\d+<\/span>/); // Some number for days
    expect(result).toMatch(/countdown-label">Days<\/span>/);
    expect(result).toMatch(/countdown-label">Hours<\/span>/);
    expect(result).toMatch(/countdown-label">Minutes<\/span>/);
    expect(result).toMatch(/countdown-label">Seconds<\/span>/);
  });

  it('should escape HTML in all text fields', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Event with <script>',
      targetDateUTC: '2030-12-31T23:59:59Z',
      illustrationSrc: 'turbo-"malicious.png',
      CTA: {
        text: 'Click "here"',
        url: 'https://example.com?param=<script>',
      },
    };

    mockEscapeHtml.mockImplementation((text: string) => `escaped:${text}`);

    const result = renderCountDownComponent(component);

    expect(mockEscapeHtml).toHaveBeenCalledWith('Event with <script>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('turbo-"malicious.png');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Click "here"');
    expect(mockEscapeHtml).toHaveBeenCalledWith(
      'https://example.com?param=<script>',
    );

    expect(result).toContain('escaped:Event with <script>');
    expect(result).toContain(
      'https://www.turboconsolelog.io/assets/escaped:turbo-"malicious.png',
    );
    expect(result).toContain('escaped:Click "here"');
  });

  it('should include target date in data attribute', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Test Event',
      targetDateUTC: '2030-12-31T23:59:59Z',
      illustrationSrc: 'turbo-test-widget.png',
      CTA: {
        text: 'Test',
        url: 'https://test.com',
      },
    };

    const result = renderCountDownComponent(component);

    expect(result).toContain('data-target-date="2030-12-31T23:59:59.000Z"');
  });

  it('should include CTA button', () => {
    const component: CountDownPanelComponent = {
      eventName: 'CTA Test Event',
      targetDateUTC: '2030-12-31T23:59:59Z',
      illustrationSrc: 'turbo-cta-test.png',
      CTA: {
        text: 'Join Event',
        url: 'https://join.example.com',
      },
    };

    const result = renderCountDownComponent(component);

    expect(result).toContain('Join Event');
    expect(result).toContain('https://join.example.com');
    expect(result).toContain('class="countdown-cta"');
  });
});
