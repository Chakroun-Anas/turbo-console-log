import { WorkspaceLogCountComponent } from '../types';
import { escapeHtml } from './escapeHtml';

/**
 * Format large numbers with K suffix (1000 -> 1K, 1500 -> 1.5K)
 */
function formatLogCount(count: number): string {
  if (count >= 1000) {
    const thousands = count / 1000;
    return count % 1000 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Render the locked Pro feature board (the upsell teaser shown inside the
 * analytics card). Returns '' when no features are provided so the dynamic
 * content path and other callers are unaffected. When `unlockUrl` is set, the
 * board header becomes a tracked link to the Pro page.
 */
function renderLockedFeaturesBoard(
  lockedFeatures: WorkspaceLogCountComponent['lockedFeatures'],
  unlockUrl?: string,
): string {
  if (!lockedFeatures || lockedFeatures.length === 0) {
    return '';
  }
  const rows = lockedFeatures
    .map((feature) => {
      // Hero features (the v3.25.0 cleanup story) get the full treatment with a
      // version badge + description. Supporting features collapse to a compact,
      // name-only row to keep the board short.
      if (feature.isNew) {
        return `
            <div class="feature-item feature-locked">
              <div class="feature-icon">${escapeHtml(feature.icon)}</div>
              <div class="feature-content">
                <div class="feature-name">${escapeHtml(feature.name)}<span class="new-badge">v3.25.0</span></div>
                <div class="feature-desc">${escapeHtml(feature.desc)}</div>
              </div>
            </div>`;
      }
      return `
            <div class="feature-item feature-locked feature-compact">
              <div class="feature-icon">${escapeHtml(feature.icon)}</div>
              <div class="feature-content">
                <div class="feature-name">${escapeHtml(feature.name)}</div>
              </div>
            </div>`;
    })
    .join('');
  const header = unlockUrl
    ? `<h4 class="section-title">
          <a class="pro-unlock-link" onclick="openUrlWithTracking('${escapeHtml(
            unlockUrl,
          )}', 'pro-locked-board', 'Unlock with Turbo Pro'); return false;" style="cursor: pointer;">🔒 Unlock with Turbo Pro →</a>
        </h4>`
    : `<h4 class="section-title">🔒 Unlock with Turbo Pro</h4>`;
  return `
      <div class="analytics-section pro-locked-section">
        ${header}
        <div class="feature-list">${rows}
        </div>
      </div>`;
}

/**
 * Render a workspace log count component as HTML with real data visualization
 * @param component The workspace log count component to render
 * @returns HTML string for the workspace log count component
 */
export function renderWorkspaceLogCountComponent(
  component: WorkspaceLogCountComponent,
): string {
  const { logCount, metadata } = component;
  const formattedCount = formatLogCount(logCount);

  const lockedBoardHtml = renderLockedFeaturesBoard(
    component.lockedFeatures,
    component.unlockUrl,
  );

  // No analytics data to chart. When a locked Pro board is provided, render it
  // on its own (no "0 Logs" header for a fresh workspace) so the features + the
  // CTA below still show. Otherwise fall back to the original simple count card.
  if (!metadata || metadata.totalLogs === 0) {
    if (lockedBoardHtml) {
      return `
      <div class="workspace-analytics-card">
        ${lockedBoardHtml}
      </div>
    `;
    }
    return `
      <div class="workspace-analytics-card">
        <div class="analytics-header">
          <h3 class="analytics-title">📊 ${escapeHtml(component.title)}</h3>
          <div class="log-count-badge">${formattedCount} Logs</div>
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
        <div class="log-count-badge">${formattedCount} Logs</div>
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

      ${lockedBoardHtml}
    </div>
  `;
}
