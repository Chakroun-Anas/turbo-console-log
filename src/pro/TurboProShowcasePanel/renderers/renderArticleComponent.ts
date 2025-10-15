import { ArticlePanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render an article component as HTML (for articles section)
 * @param component The article component to render
 * @returns HTML string for the article component
 */
export function renderArticleComponent(
  component: ArticlePanelComponent,
): string {
  // Map illustrationFocus to CSS object-position values
  const focusMap = {
    top: 'center 10%',
    center: 'center center',
    bottom: 'center 90%',
  };
  const objectPosition =
    focusMap[component.illustrationFocus || 'top'] || 'center 10%';

  return `
      <div class="article-card" onclick="openUrlWithTracking('${escapeHtml(component.url)}', 'article', '${escapeHtml(component.title)}')">
        <img src="${escapeHtml(component.illustrationSrc)}" alt="${escapeHtml(component.title)}" class="article-image" style="object-position: ${objectPosition};" />
        <div class="article-title">${escapeHtml(component.title)}</div>
        <div class="article-desc">${escapeHtml(component.description)}</div>
      </div>
    `;
}
