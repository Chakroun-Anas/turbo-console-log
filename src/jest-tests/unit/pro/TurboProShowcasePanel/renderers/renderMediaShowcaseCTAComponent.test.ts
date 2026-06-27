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

  describe('tagline feature', () => {
    it('should render tagline when provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Stop hunting logs file by file',
        cta: {
          text: 'Take Back Control',
          url: 'https://example.com/pro',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="media-showcase-tagline"');
      expect(result).toContain('Stop hunting logs file by file');
    });

    it('should NOT render tagline section when tagline is undefined', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        cta: {
          text: 'Learn More',
          url: 'https://example.com/feature',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('class="media-showcase-tagline"');
    });

    it('should NOT render tagline section when tagline is empty string', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: '',
        cta: {
          text: 'Learn More',
          url: 'https://example.com/feature',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      // Empty string is falsy, so tagline section should not render
      expect(result).not.toContain('class="media-showcase-tagline"');
    });

    it('should escape HTML in tagline', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Get <strong>Pro</strong> features now!',
        cta: {
          text: 'Upgrade',
          url: 'https://example.com/upgrade',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('<strong>Pro</strong>');
      expect(result).toContain('&lt;strong&gt;Pro&lt;/strong&gt;');
    });

    it('should render tagline between images and CTA button', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Your perfect tagline',
        cta: {
          text: 'Click Here',
          url: 'https://example.com/page',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      const imagesIndex = result.indexOf('class="media-showcase-images"');
      const taglineIndex = result.indexOf('class="media-showcase-tagline"');
      const buttonIndex = result.indexOf('class="media-showcase-cta-button"');

      expect(imagesIndex).toBeLessThan(taglineIndex);
      expect(taglineIndex).toBeLessThan(buttonIndex);
    });

    it('should handle long taglines', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline:
          'This is a very long tagline that explains the product features in detail and provides comprehensive information to the user',
        cta: {
          text: 'Learn More',
          url: 'https://example.com/details',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="media-showcase-tagline"');
      expect(result).toContain('very long tagline');
    });
  });

  describe('subtitle feature', () => {
    it('should render subtitle when provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Never commit a debug log again',
        subtitle: 'Removed on commit, always previewed. Pay once, yours forever.',
        cta: {
          text: 'Turn On Auto-Cleanup',
          url: 'https://example.com/pro',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="media-showcase-subtitle"');
      expect(result).toContain('Pay once, yours forever.');
    });

    it('should NOT render subtitle section when subtitle is undefined', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Never commit a debug log again',
        cta: {
          text: 'Turn On Auto-Cleanup',
          url: 'https://example.com/pro',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('class="media-showcase-subtitle"');
    });

    it('should escape HTML in subtitle', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        subtitle: 'Removes <strong>all</strong> logs',
        cta: {
          text: 'Upgrade',
          url: 'https://example.com/upgrade',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('<strong>all</strong>');
      expect(result).toContain('&lt;strong&gt;all&lt;/strong&gt;');
    });

    it('should render subtitle between tagline and CTA button', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Headline',
        subtitle: 'Supporting line',
        cta: {
          text: 'Click Here',
          url: 'https://example.com/page',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      const taglineIndex = result.indexOf('class="media-showcase-tagline"');
      const subtitleIndex = result.indexOf('class="media-showcase-subtitle"');
      const buttonIndex = result.indexOf('class="media-showcase-cta-button"');

      expect(taglineIndex).toBeLessThan(subtitleIndex);
      expect(subtitleIndex).toBeLessThan(buttonIndex);
    });
  });

  describe('testimonial feature', () => {
    it('renders the testimonial before the CTA button when provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        tagline: 'Never commit a debug log again',
        cta: {
          text: 'Turn On Auto-Cleanup',
          url: 'https://example.com/pro',
        },
        testimonial: {
          quote: 'The Pro Plan is super worthy.',
          author: 'Caio Lemos',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="testimonial-section"');
      expect(result).toContain('The Pro Plan is super worthy.');
      expect(result).toContain('Caio Lemos');

      // The testimonial renders at the TOP of the block — before the CTA button.
      const testimonialIndex = result.indexOf('class="testimonial-section"');
      const ctaButtonIndex = result.indexOf('class="media-showcase-cta-button"');
      expect(testimonialIndex).toBeLessThan(ctaButtonIndex);
    });

    it('does NOT render a testimonial section when none is provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        cta: {
          text: 'Learn More',
          url: 'https://example.com/feature',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('class="testimonial-section"');
    });

    it('escapes HTML in the testimonial quote and author', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/image.png'],
        cta: {
          text: 'Go',
          url: 'https://example.com/pro',
        },
        testimonial: {
          quote: '<script>x</script>',
          author: '<u>Author</u>',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('<script>x</script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<u>Author</u>');
      expect(result).toContain('&lt;u&gt;Author&lt;/u&gt;');
    });
  });

  describe('cleanup demo', () => {
    it('renders the cleanup demo with struck-through removed lines (no mascot)', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: [],
        cta: {
          text: 'Turn On Auto-Cleanup',
          url: 'https://example.com/pro',
        },
        codeDemo: {
          lines: [
            { text: 'function pay(cart) {' },
            { text: '  console.log(cart)', removed: true },
            { text: '  return total' },
          ],
          caption: '🧹 1 debug log removed on commit',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="cleanup-demo"');
      expect(result).toContain('class="cleanup-demo-line removed"');
      expect(result).toContain('console.log(cart)');
      expect(result).toContain('🧹 1 debug log removed on commit');
      // No mascot image when illustrationSrcs is empty.
      expect(result).not.toContain('class="media-showcase-image"');
    });

    it('does NOT render a demo when none is provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: ['https://example.com/img.png'],
        cta: {
          text: 'Go',
          url: 'https://example.com/pro',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('class="cleanup-demo"');
    });

    it('escapes HTML in demo lines', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: [],
        cta: {
          text: 'Go',
          url: 'https://example.com/pro',
        },
        codeDemo: {
          lines: [{ text: '<script>x</script>', removed: true }],
          caption: 'done',
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('<script>x</script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('settings demo', () => {
    it('renders the cleanup-config panel with on/off toggles', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: [],
        cta: { text: 'Go', url: 'https://example.com/pro' },
        settingsDemo: {
          title: 'Log Cleanup config',
          items: [
            { label: 'Auto-cleanup on Commit', on: true },
            { label: '🚀 Turbo Logs Only', on: false },
          ],
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).toContain('class="settings-demo"');
      expect(result).toContain('Log Cleanup config');
      expect(result).toContain('Auto-cleanup on Commit');
      expect(result).toContain('class="settings-demo-toggle on"');
      expect(result).toContain('class="settings-demo-toggle off"');
    });

    it('does NOT render a settings panel when none is provided', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: [],
        cta: { text: 'Go', url: 'https://example.com/pro' },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('class="settings-demo"');
    });

    it('escapes HTML in settings labels', () => {
      const component: MediaShowcaseCTAPanelComponent = {
        illustrationSrcs: [],
        cta: { text: 'Go', url: 'https://example.com/pro' },
        settingsDemo: {
          title: '<b>Cfg</b>',
          items: [{ label: '<i>opt</i>', on: true }],
        },
      };

      const result = renderMediaShowcaseCTAComponent(component);

      expect(result).not.toContain('<b>Cfg</b>');
      expect(result).toContain('&lt;b&gt;Cfg&lt;/b&gt;');
      expect(result).not.toContain('<i>opt</i>');
    });
  });
});
