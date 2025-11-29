import { VideoPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a video component with caption as HTML
 * @param component The video component to render
 * @returns HTML string for the video component
 */
export function renderVideoComponent(component: VideoPanelComponent): string {
  const autoplay = component.autoplay ? 'autoplay' : '';
  const loop = component.loop ? 'loop' : '';
  const muted = component.muted ? 'muted' : '';
  const videoId = escapeHtml(component.videoSrc);
  const videoCaption = escapeHtml(component.caption);

  return `
    <div class="video-component">
      <video 
        class="video-player" 
        controls 
        ${autoplay} 
        ${loop} 
        ${muted}
        playsinline
        preload="metadata"
        data-video-id="${videoId}"
        data-video-caption="${videoCaption}"
      >
        <source src="${videoId}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <p class="video-caption">${videoCaption}</p>
    </div>
  `;
}
