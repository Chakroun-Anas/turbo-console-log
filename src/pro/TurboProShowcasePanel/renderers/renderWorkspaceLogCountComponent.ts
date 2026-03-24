import { WorkspaceLogCountComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Render a workspace log count component as HTML with real data visualization
 * @param component The workspace log count component to render
 * @returns HTML string for the workspace log count component
 */
export function renderWorkspaceLogCountComponent(
  component: WorkspaceLogCountComponent,
): string {
  const { logCount, metadata } = component;

  // If no metadata available, show simple count fallback
  if (!metadata || metadata.totalLogs === 0) {
    return `
      <div class="workspace-analytics-card">
        <div class="analytics-header">
          <h3 class="analytics-title">📊 ${escapeHtml(component.title)}</h3>
          <div class="log-count-badge">${logCount} Logs</div>
        </div>
        <p class="analytics-description">${escapeHtml(component.description)}</p>
      </div>
    `;
  }

  const { repositories, logTypeDistribution } = metadata;

  // Calculate repository chart data (top 5 + "others")
  const sortedRepos = [...repositories].sort((a, b) => b.logCount - a.logCount);
  const topRepos = sortedRepos.slice(0, 5);
  const othersCount =
    sortedRepos.length > 5
      ? sortedRepos.slice(5).reduce((sum, repo) => sum + repo.logCount, 0)
      : 0;

  return `
    <div class="workspace-analytics-card">
      <!-- Analytics Header -->
      <div class="analytics-header">
        <h3 class="analytics-title">${escapeHtml(component.title)} 🚀</h3>
        <div class="log-count-badge">${logCount} Logs</div>
      </div>

      <!-- Repository Breakdown -->
      ${
        repositories.length > 0
          ? `
      <div class="analytics-section">
        <h4 class="section-title">📁 ${repositories.length} ${repositories.length === 1 ? 'Repository' : 'Repositories'} Involved</h4>
        <div class="repo-chart">
          ${topRepos
            .map(
              (repo) => `
            <div class="repo-bar">
              <div class="repo-name" title="${escapeHtml(repo.path)}">${escapeHtml(repo.name)}</div>
              <div class="repo-bar-container">
                <div class="repo-bar-fill" style="width: ${(repo.logCount / metadata.totalLogs) * 100}%"></div>
                <span class="repo-count">${repo.logCount} logs</span>
              </div>
            </div>
          `,
            )
            .join('')}
          ${
            othersCount > 0
              ? `
            <div class="repo-bar">
              <div class="repo-name">Others (${sortedRepos.length - 5})</div>
              <div class="repo-bar-container">
                <div class="repo-bar-fill" style="width: ${(othersCount / metadata.totalLogs) * 100}%"></div>
                <span class="repo-count">${othersCount} logs</span>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
      `
          : ''
      }

      <!-- Log Type Distribution -->
      ${
        logTypeDistribution.length > 0
          ? `
      <div class="analytics-section">
        <h4 class="section-title">🎨 Log Type Distribution</h4>
        <div class="log-type-grid">
          ${logTypeDistribution
            .map(
              (logType) => `
            <div class="log-type-card">
              <div class="log-type-name">${escapeHtml(logType.type)}</div>
              <div class="log-type-stats">
                <div class="log-type-count">${logType.count}</div>
                <div class="log-type-percentage">${logType.percentage}%</div>
              </div>
              <div class="log-type-bar">
                <div class="log-type-bar-fill" style="width: ${logType.percentage}%"></div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }

      <!-- Per-Repository Insights Section -->
      ${
        logCount >= 50 && repositories.length > 0
          ? `
      <div class="analytics-section impact-section">
        <h4 class="section-title">🎯 Repository Insights</h4>
        <div class="impact-grid">
          ${repositories
            .map(
              (repo) => `
          <!-- ${escapeHtml(repo.name)} - Files -->
          <div class="impact-card impact-card-highlight">
            <div class="impact-metric">${repo.fileCount}</div>
            <div class="impact-label" title="${escapeHtml(repo.path)}">${escapeHtml(repo.name)} Files</div>
            <div class="impact-hint">→ Pro Tree View shows all</div>
          </div>
          
          ${
            repo.topNestedFolder
              ? `
          <!-- ${escapeHtml(repo.name)} - Hotspot -->
          <div class="impact-card impact-card-highlight">
            <div class="impact-metric">${repo.topNestedFolder.logCount}</div>
            <div class="impact-label" title="${escapeHtml(repo.path)}/${escapeHtml(repo.topNestedFolder.relativePath)}">Hotspot: ${escapeHtml(repo.topNestedFolder.relativePath)}</div>
            <div class="impact-hint">${repo.topNestedFolder.percentage}% of ${escapeHtml(repo.name)} logs</div>
          </div>
          `
              : ''
          }
          `,
            )
            .join('')}
        </div>
        <div class="insights-footer">
          💡 <strong>Pro Tip:</strong> Use Git Filter to focus on your current changed files and the Pro Tree View to navigate them all
        </div>
      </div>
      `
          : ''
      }
    </div>
  `;
}
