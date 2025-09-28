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
      illustrationSrc: 'celebration.jpg',
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
    expect(mockEscapeHtml).toHaveBeenCalledWith('celebration.jpg');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Learn More');
    expect(mockEscapeHtml).toHaveBeenCalledWith('https://example.com');
  });

  it('should return empty string for past date', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Past Event',
      targetDateUTC: '2020-01-01T00:00:00Z', // Definitely past date
      illustrationSrc: 'past.jpg',
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
      illustrationSrc: 'test.jpg',
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
      illustrationSrc: 'image"malicious.jpg',
      CTA: {
        text: 'Click "here"',
        url: 'https://example.com?param=<script>',
      },
    };

    mockEscapeHtml.mockImplementation((text: string) => `escaped:${text}`);

    const result = renderCountDownComponent(component);

    expect(mockEscapeHtml).toHaveBeenCalledWith('Event with <script>');
    expect(mockEscapeHtml).toHaveBeenCalledWith('image"malicious.jpg');
    expect(mockEscapeHtml).toHaveBeenCalledWith('Click "here"');
    expect(mockEscapeHtml).toHaveBeenCalledWith(
      'https://example.com?param=<script>',
    );

    expect(result).toContain('escaped:Event with <script>');
    expect(result).toContain('escaped:image"malicious.jpg');
    expect(result).toContain('escaped:Click "here"');
  });

  it('should include target date in data attribute', () => {
    const component: CountDownPanelComponent = {
      eventName: 'Test Event',
      targetDateUTC: '2030-12-31T23:59:59Z',
      illustrationSrc: 'test.jpg',
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
      illustrationSrc: 'cta.jpg',
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
