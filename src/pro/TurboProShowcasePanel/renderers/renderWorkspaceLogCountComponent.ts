import { WorkspaceLogCountComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a workspace log count component as HTML with color-coded count
 * @param component The workspace log count component to render
 * @returns HTML string for the workspace log count component
 */
export function renderWorkspaceLogCountComponent(
  component: WorkspaceLogCountComponent,
): string {
  return `
      <div class="dynamic-content workspace-log-count">
        <h3>${escapeHtml(component.title)}</h3>
        <p>
          Your workspace has 
          <span style="color: #FF6B6B; font-weight: bold;">
            ${component.logCount}
          </span> 
          logs. ${escapeHtml(component.description)}
        </p>
      </div>
    `;
}
