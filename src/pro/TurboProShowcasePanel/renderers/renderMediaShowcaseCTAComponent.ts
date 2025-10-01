import { MediaShowcaseCTAPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a media showcase CTA component as HTML
 * @param component The media showcase CTA component to render
 * @returns HTML string for the media showcase CTA component
 */
export function renderMediaShowcaseCTAComponent(
  component: MediaShowcaseCTAPanelComponent,
): string {
  // Generate HTML for all illustrations
  const imagesHtml = component.illustrationSrcs
    .map(
      (src) =>
        `<img src="${escapeHtml(src)}" alt="Media showcase" class="media-showcase-image" />`,
    )
    .join('');

  return `
      <div class="media-showcase-cta">
        <div class="media-showcase-images">
          ${imagesHtml}
        </div>
        <a class="media-showcase-cta-button" onclick="openUrlWithTracking('${escapeHtml(component.cta.url)}', 'media-showcase-cta', '${escapeHtml(component.cta.text)}'); return false;" style="cursor: pointer;">
          ${escapeHtml(component.cta.text)}
        </a>
      </div>
    `;
}
