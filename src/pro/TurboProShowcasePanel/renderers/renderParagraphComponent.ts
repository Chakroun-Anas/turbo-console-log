import { ParagraphPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a paragraph component as HTML
 * @param component The paragraph component to render
 * @returns HTML string for the paragraph component
 */
export function renderParagraphComponent(
  component: ParagraphPanelComponent,
): string {
  // Render content as raw HTML if rawHtml flag is set, otherwise escape for safety
  const contentHtml = component.rawHtml
    ? component.content
    : `<p>${escapeHtml(component.content)}</p>`;

  return `
      <div class="dynamic-content">
        <h3>${escapeHtml(component.title)}</h3>
        ${contentHtml}
      </div>
    `;
}
