import { renderMediaShowcaseCTAComponent } from '@/pro/TurboProShowcasePanel/renderers/renderMediaShowcaseCTAComponent';
import { MediaShowcaseCTAPanelComponent } from '@/pro/TurboProShowcasePanel/types';

describe('renderMediaShowcaseCTAComponent', () => {
  it('should render media showcase with single illustration', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/image.png'],
      cta: {
        text: 'Learn More',
        url: 'https://example.com/feature',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).toContain('class="media-showcase-cta"');
    expect(result).toContain(
      '<img src="https://example.com/image.png" alt="Media showcase" class="media-showcase-image" />',
    );
    expect(result).toContain('class="media-showcase-cta-button"');
    expect(result).toContain('Learn More');
  });

  it('should render media showcase with multiple illustrations', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ],
      cta: {
        text: 'View Gallery',
        url: 'https://example.com/gallery',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).toContain('class="media-showcase-cta"');
    expect(result).toContain(
      '<img src="https://example.com/image1.png" alt="Media showcase" class="media-showcase-image" />',
    );
    expect(result).toContain(
      '<img src="https://example.com/image2.png" alt="Media showcase" class="media-showcase-image" />',
    );
    expect(result).toContain(
      '<img src="https://example.com/image3.png" alt="Media showcase" class="media-showcase-image" />',
    );
    expect(result).toContain('View Gallery');
  });

  it('should include onclick tracking with correct parameters', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/demo.png'],
      cta: {
        text: 'Try Demo',
        url: 'https://example.com/demo',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).toContain(
      "onclick=\"openUrlWithTracking('https://example.com/demo', 'media-showcase-cta', 'Try Demo'); return false;\"",
    );
    expect(result).toContain('style="cursor: pointer;"');
  });

  it('should escape HTML in image URLs', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/image<script>.png'],
      cta: {
        text: 'Click Here',
        url: 'https://example.com/page',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should escape HTML in CTA text', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/image.png'],
      cta: {
        text: 'Click <b>Here</b>',
        url: 'https://example.com/page',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).not.toContain('<b>Here</b>');
    expect(result).toContain('&lt;b&gt;Here&lt;/b&gt;');
  });

  it('should escape HTML in CTA URL', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/image.png'],
      cta: {
        text: 'Click Here',
        url: 'https://example.com/page?param=<script>alert(1)</script>',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).not.toContain('<script>alert(1)</script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should handle empty illustrations array', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: [],
      cta: {
        text: 'Learn More',
        url: 'https://example.com/feature',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).toContain('class="media-showcase-cta"');
    expect(result).not.toContain('class="media-showcase-image"');
    expect(result).toContain('class="media-showcase-cta-button"');
    expect(result).toContain('Learn More');
  });

  it('should maintain image order', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: [
        'https://example.com/first.png',
        'https://example.com/second.png',
        'https://example.com/third.png',
      ],
      cta: {
        text: 'View All',
        url: 'https://example.com/all',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    const firstIndex = result.indexOf('first.png');
    const secondIndex = result.indexOf('second.png');
    const thirdIndex = result.indexOf('third.png');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  it('should render CTA button after all images', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ],
      cta: {
        text: 'Get Started',
        url: 'https://example.com/start',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    const lastImageIndex = result.lastIndexOf('class="media-showcase-image"');
    const ctaButtonIndex = result.indexOf('class="media-showcase-cta-button"');

    expect(lastImageIndex).toBeLessThan(ctaButtonIndex);
  });

  it('should handle special characters in URLs', () => {
    const component: MediaShowcaseCTAPanelComponent = {
      illustrationSrcs: ['https://example.com/image.png?width=800&height=600'],
      cta: {
        text: 'View',
        url: 'https://example.com/page?a=1&b=2',
      },
    };

    const result = renderMediaShowcaseCTAComponent(component);

    expect(result).toContain('width=800&amp;height=600');
    expect(result).toContain('a=1&amp;b=2');
  });
});
