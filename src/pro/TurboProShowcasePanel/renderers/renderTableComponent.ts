import { TablePanelComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a table component as HTML
 * @param component The table component to render
 * @returns HTML string for the table component
 */
export function renderTableComponent(component: TablePanelComponent): string {
  const headerRow = component.columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join('');

  const bodyRows = component.rows
    .map((row) => {
      const cells = component.columns
        .map((column) => `<td>${escapeHtml(row[column] || '')}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
      <section class="section">
        <h3>${escapeHtml(component.title)}</h3>
        <table class="commands-table">
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </section>
    `;
}
