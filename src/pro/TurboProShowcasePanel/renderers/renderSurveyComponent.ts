import { SurveyPanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a survey component as HTML
 * @param component The survey component to render
 * @returns HTML string for the survey component
 */
export function renderSurveyComponent(component: SurveyPanelComponent): string {
  return `
      <section class="survey-section">
        <h3>${escapeHtml(component.title)}</h3>
        <p>${escapeHtml(component.description)}</p>
        <a class="survey-cta" onclick="openUrlWithTracking('${escapeHtml(component.CTA.url)}', 'survey', '${escapeHtml(component.CTA.text)}'); return false;" style="cursor: pointer;">
          ${escapeHtml(component.CTA.text)}
        </a>
      </section>
    `;
}
