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
  return `
      <div class="dynamic-content">
        <h3>${escapeHtml(component.title)}</h3>
        <p>${escapeHtml(component.content)}</p>
      </div>
    `;
}
