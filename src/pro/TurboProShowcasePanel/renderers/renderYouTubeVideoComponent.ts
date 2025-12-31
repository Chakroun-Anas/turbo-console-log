import { YouTubeVideoPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a YouTube video component as a clickable card with thumbnail
 * Note: YouTube iframe embeds don't work in VSCode webviews due to CSP restrictions,
 * so we display a thumbnail card that opens the video in the browser
 * @param component The YouTube video component to render
 * @returns HTML string for the YouTube video component
 */
export function renderYouTubeVideoComponent(
  component: YouTubeVideoPanelComponent,
): string {
  const videoId = escapeHtml(component.youtubeVideoId);
  const caption = escapeHtml(component.caption);
  const title = escapeHtml(component.title || 'Watch on YouTube');

  // YouTube thumbnail URL (maxresdefault for highest quality, fallback to hqdefault)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Add start time if provided
  const urlWithTime = component.startTime
    ? `${videoUrl}&t=${component.startTime}s`
    : videoUrl;

  return `
    <div class="youtube-video-component">
      <div 
        class="youtube-video-card" 
        onclick="openUrlWithTracking('${escapeHtml(urlWithTime)}', 'youtube-video', '${escapeHtml(title)}'); return false;"
        style="cursor: pointer;"
      >
        <div class="youtube-thumbnail-wrapper">
          <img 
            src="${thumbnailUrl}" 
            alt="${title}"
            class="youtube-thumbnail"
            onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"
          />
          <div class="youtube-play-overlay">
            <svg class="youtube-play-icon" viewBox="0 0 68 48" width="68" height="48">
              <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
              <path d="M 45,24 27,14 27,34" fill="#fff"></path>
            </svg>
          </div>
        </div>
        <div class="youtube-video-info">
          <h4 class="youtube-video-title">${title}</h4>
          <p class="youtube-video-caption">${caption}</p>
          <span class="youtube-video-cta">Click to watch on YouTube →</span>
        </div>
      </div>
    </div>
  `;
}
