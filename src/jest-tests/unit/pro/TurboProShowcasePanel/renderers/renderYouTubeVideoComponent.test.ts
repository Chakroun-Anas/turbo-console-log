import { renderYouTubeVideoComponent } from '@/pro/TurboProShowcasePanel/renderers/renderYouTubeVideoComponent';
import { YouTubeVideoPanelComponent } from '@/pro/TurboProShowcasePanel/types';

describe('renderYouTubeVideoComponent', () => {
  it('should render YouTube video card with thumbnail and title', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'dQw4w9WgXcQ',
      caption: 'This is a demo YouTube video showing the feature',
      title: 'Demo Video',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('class="youtube-video-component"');
    expect(html).toContain('class="youtube-video-card"');
    expect(html).toContain('class="youtube-thumbnail"');
    expect(html).toContain(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    );
    expect(html).toContain('class="youtube-video-title"');
    expect(html).toContain('Demo Video');
    expect(html).toContain('class="youtube-video-caption"');
    expect(html).toContain('This is a demo YouTube video showing the feature');
    expect(html).toContain('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('should render YouTube video card with default title', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'abc123xyz',
      caption: 'Simple YouTube video demo',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('class="youtube-video-component"');
    expect(html).toContain(
      'https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg',
    );
    expect(html).toContain('Watch on YouTube'); // Default title
    expect(html).toContain('Simple YouTube video demo');
    expect(html).toContain('https://www.youtube.com/watch?v=abc123xyz');
  });

  it('should include play overlay icon', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'test123',
      caption: 'Test video',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('class="youtube-play-overlay"');
    expect(html).toContain('class="youtube-play-icon"');
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox="0 0 68 48"');
  });

  it('should escape HTML in caption and title', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'abc<script>alert(1)</script>',
      caption: 'Caption with <b>HTML</b> tags & special chars',
      title: 'Title with <script> tags',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&amp;');
  });

  it('should include onclick tracking', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'test456',
      caption: 'Tracked video',
      title: 'Test Video',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('onclick=');
    expect(html).toContain('openUrlWithTracking');
    expect(html).toContain('youtube-video');
    expect(html).toContain('Test Video');
  });

  it('should include CTA text', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'cta123',
      caption: 'Video with CTA',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('Click to watch on YouTube');
    expect(html).toContain('class="youtube-video-cta"');
  });

  it('should include start time in URL when provided', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'time789',
      caption: 'Video starting at specific time',
      startTime: 120,
    };

    const html = renderYouTubeVideoComponent(component);

    // URL is escaped, so & becomes &amp;
    expect(html).toContain('&amp;t=120s');
    expect(html).toContain(
      'https://www.youtube.com/watch?v=time789&amp;t=120s',
    );
  });

  it('should include thumbnail with fallback', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'fallback123',
      caption: 'Video with fallback',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('class="youtube-thumbnail-wrapper"');
    expect(html).toContain('onerror=');
    expect(html).toContain('hqdefault.jpg');
  });

  it('should render video info section', () => {
    const component: YouTubeVideoPanelComponent = {
      youtubeVideoId: 'info123',
      caption: 'Video caption',
      title: 'Video Title',
    };

    const html = renderYouTubeVideoComponent(component);

    expect(html).toContain('class="youtube-video-info"');
    expect(html).toContain('class="youtube-video-title"');
    expect(html).toContain('class="youtube-video-caption"');
  });
});
