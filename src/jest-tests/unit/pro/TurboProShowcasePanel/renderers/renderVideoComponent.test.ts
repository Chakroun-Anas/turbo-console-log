import { renderVideoComponent } from '@/pro/TurboProShowcasePanel/renderers/renderVideoComponent';
import { VideoPanelComponent } from '@/pro/TurboProShowcasePanel/types';

describe('renderVideoComponent', () => {
  it('should render video component with all properties', () => {
    const component: VideoPanelComponent = {
      videoSrc: 'https://example.com/video.mp4',
      caption: 'This is a demo video showing the feature',
      autoplay: true,
      loop: true,
      muted: true,
    };

    const html = renderVideoComponent(component);

    expect(html).toContain('class="video-component"');
    expect(html).toContain('class="video-player"');
    expect(html).toContain('controls');
    expect(html).toContain('autoplay');
    expect(html).toContain('loop');
    expect(html).toContain('muted');
    expect(html).toContain('playsinline');
    expect(html).toContain(
      '<source src="https://example.com/video.mp4" type="video/mp4">',
    );
    expect(html).toContain('class="video-caption"');
    expect(html).toContain('This is a demo video showing the feature');
  });

  it('should render video without optional autoplay, loop, muted attributes', () => {
    const component: VideoPanelComponent = {
      videoSrc: 'https://example.com/demo.mp4',
      caption: 'Simple video demo',
    };

    const html = renderVideoComponent(component);

    expect(html).toContain('class="video-component"');
    expect(html).toContain('controls');
    expect(html).toContain('playsinline');
    expect(html).not.toContain('autoplay');
    expect(html).not.toContain('loop');
    expect(html).not.toContain('muted');
    expect(html).toContain(
      '<source src="https://example.com/demo.mp4" type="video/mp4">',
    );
    expect(html).toContain('Simple video demo');
  });

  it('should escape HTML in video source and caption', () => {
    const component: VideoPanelComponent = {
      videoSrc: 'https://example.com/video.mp4?param=<script>alert(1)</script>',
      caption: 'Caption with <b>HTML</b> tags & special chars',
    };

    const html = renderVideoComponent(component);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>HTML</b>');
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(html).toContain('&amp;');
  });

  it('should include fallback message for unsupported browsers', () => {
    const component: VideoPanelComponent = {
      videoSrc: 'https://example.com/video.mp4',
      caption: 'Demo video',
    };

    const html = renderVideoComponent(component);

    expect(html).toContain('Your browser does not support the video tag.');
  });
});
