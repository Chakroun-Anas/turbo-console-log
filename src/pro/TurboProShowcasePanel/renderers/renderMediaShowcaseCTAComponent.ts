import { MediaShowcaseCTAPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render the optional inline "before/after" cleanup demo — a small code block
 * where the debug-log lines render struck-through, shown in place of an
 * illustration so the closing card demonstrates auto-cleanup instead of just
 * decorating. Returns '' when no demo is provided.
 */
function renderCleanupDemo(
  codeDemo: MediaShowcaseCTAPanelComponent['codeDemo'],
): string {
  if (!codeDemo || codeDemo.lines.length === 0) {
    return '';
  }
  const linesHtml = codeDemo.lines
    .map(
      (line) =>
        `<div class="cleanup-demo-line${line.removed ? ' removed' : ''}">${escapeHtml(line.text)}</div>`,
    )
    .join('');
  return `
        <div class="cleanup-demo">
          ${linesHtml}
          <div class="cleanup-demo-caption">${escapeHtml(codeDemo.caption)}</div>
        </div>`;
}

/**
 * Render the optional tiny "cleanup config" panel — labeled on/off toggles that
 * show what controls the cleanup, so the demo's picture is complete. Returns ''
 * when no settings are provided.
 */
function renderSettingsDemo(
  settingsDemo: MediaShowcaseCTAPanelComponent['settingsDemo'],
): string {
  if (!settingsDemo || settingsDemo.items.length === 0) {
    return '';
  }
  const itemsHtml = settingsDemo.items
    .map(
      (item) =>
        `<div class="settings-demo-item"><span class="settings-demo-toggle ${item.on ? 'on' : 'off'}">${item.on ? '✓' : ''}</span>${escapeHtml(item.label)}</div>`,
    )
    .join('');
  return `
        <div class="settings-demo">
          <div class="settings-demo-title">⚙ ${escapeHtml(settingsDemo.title)}</div>
          ${itemsHtml}
        </div>`;
}

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
  const imagesBlock =
    component.illustrationSrcs.length > 0
      ? `<div class="media-showcase-images">
          ${imagesHtml}
        </div>`
      : '';

  const settingsHtml = renderSettingsDemo(component.settingsDemo);
  const demoHtml = renderCleanupDemo(component.codeDemo);

  // Optional testimonial rendered full-width at the TOP of the showcase block —
  // i.e. right after the first main (analytics) card and before the demo.
  const testimonialHtml = component.testimonial
    ? `
      <div class="testimonial-section">
        <div class="testimonial-quote">"${escapeHtml(component.testimonial.quote)}"</div>
        <div class="testimonial-author">— ${escapeHtml(component.testimonial.author)}</div>
      </div>`
    : '';

  return `${testimonialHtml}${settingsHtml}${demoHtml}
      <div class="media-showcase-cta">
        ${imagesBlock}
        ${component.tagline ? `<div class="media-showcase-tagline">${escapeHtml(component.tagline)}</div>` : ''}
        ${component.subtitle ? `<div class="media-showcase-subtitle">${escapeHtml(component.subtitle)}</div>` : ''}
        <a class="media-showcase-cta-button" onclick="openUrlWithTracking('${escapeHtml(component.cta.url)}', 'media-showcase-cta', '${escapeHtml(component.cta.text)}'); return false;" style="cursor: pointer;">
          ${escapeHtml(component.cta.text)}
        </a>
      </div>
    `;
}
