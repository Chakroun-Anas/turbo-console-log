import { renderWorkspaceLogCountComponent } from '@/pro/TurboProShowcasePanel/renderers/renderWorkspaceLogCountComponent';
import { WorkspaceLogCountComponent } from '@/pro/TurboProShowcasePanel/types';

describe('renderWorkspaceLogCountComponent', () => {
  describe('with full metadata', () => {
    it('should render complete analytics with "logs" labels', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 150,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights into your workspace logs.',
        metadata: {
          totalLogs: 150,
          totalFiles: 25,
          repositories: [
            {
              name: 'frontend',
              path: '/workspace/frontend',
              logCount: 100,
              fileCount: 15,
              topNestedFolder: {
                relativePath: 'src/components',
                logCount: 60,
                percentage: 60,
              },
            },
            {
              name: 'backend',
              path: '/workspace/backend',
              logCount: 50,
              fileCount: 10,
              topNestedFolder: {
                relativePath: 'api/controllers',
                logCount: 30,
                percentage: 60,
              },
            },
          ],
          logTypeDistribution: [
            { type: 'console.log', count: 100, percentage: 67 },
            { type: 'console.error', count: 30, percentage: 20 },
            { type: 'console.warn', count: 20, percentage: 13 },
          ],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check "Logs" label in badge
      expect(result).toContain('150 Logs');

      // Check "logs" labels in repository bars
      expect(result).toContain('100 logs');
      expect(result).toContain('50 logs');

      // Check structure
      expect(result).toContain('class="workspace-analytics-card"');
      expect(result).toContain('class="log-count-badge"');
    });

    it('should render repository breakdown with top 5 repositories', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 300,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 300,
          totalFiles: 50,
          repositories: [
            {
              name: 'repo1',
              path: '/workspace/repo1',
              logCount: 100,
              fileCount: 10,
            },
            {
              name: 'repo2',
              path: '/workspace/repo2',
              logCount: 80,
              fileCount: 8,
            },
            {
              name: 'repo3',
              path: '/workspace/repo3',
              logCount: 60,
              fileCount: 6,
            },
            {
              name: 'repo4',
              path: '/workspace/repo4',
              logCount: 40,
              fileCount: 4,
            },
            {
              name: 'repo5',
              path: '/workspace/repo5',
              logCount: 20,
              fileCount: 2,
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check all 5 repositories are shown
      expect(result).toContain('repo1');
      expect(result).toContain('repo2');
      expect(result).toContain('repo3');
      expect(result).toContain('repo4');
      expect(result).toContain('repo5');

      // Check section title
      expect(result).toContain('5 Repositories Involved');

      // Check bar percentages (check for reasonable ranges, not exact floating point)
      expect(result).toMatch(/width:\s*33\.3\d+%/); // 100/300 ≈ 33.3%
      expect(result).toMatch(/width:\s*26\.6\d+%/); // 80/300 ≈ 26.6%
    });

    it('should show "Others" row when more than 5 repositories', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 45, // Keep below 50 to avoid rendering insights section
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 45, // Update to match logCount
          totalFiles: 70,
          repositories: [
            {
              name: 'repo1',
              path: '/workspace/repo1',
              logCount: 10,
              fileCount: 10,
            },
            {
              name: 'repo2',
              path: '/workspace/repo2',
              logCount: 8,
              fileCount: 8,
            },
            {
              name: 'repo3',
              path: '/workspace/repo3',
              logCount: 7,
              fileCount: 6,
            },
            {
              name: 'repo4',
              path: '/workspace/repo4',
              logCount: 6,
              fileCount: 4,
            },
            {
              name: 'repo5',
              path: '/workspace/repo5',
              logCount: 5,
              fileCount: 3,
            },
            {
              name: 'repo6',
              path: '/workspace/repo6',
              logCount: 5,
              fileCount: 4,
            },
            {
              name: 'repo7',
              path: '/workspace/repo7',
              logCount: 4,
              fileCount: 2,
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check "Others" row exists
      expect(result).toContain('Others (2)');

      // Check others count: 5 + 4 = 9 logs
      expect(result).toContain('9 logs');

      // Check that repo6 and repo7 are NOT directly shown in repo chart (they're in "Others")
      // They won't appear in insights section either since logCount < 50
      expect(result).not.toContain('>repo6<');
      expect(result).not.toContain('>repo7<');
    });

    it('should render log type distribution with percentages', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 200,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 200,
          totalFiles: 30,
          repositories: [],
          logTypeDistribution: [
            { type: 'console.log', count: 120, percentage: 60 },
            { type: 'console.error', count: 50, percentage: 25 },
            { type: 'console.warn', count: 30, percentage: 15 },
          ],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check section title
      expect(result).toContain('Log Type Distribution');

      // Check each log type with count and percentage
      expect(result).toContain('console.log');
      expect(result).toContain('<div class="log-type-count">120</div>');
      expect(result).toContain('<div class="log-type-percentage">60%</div>');

      expect(result).toContain('console.error');
      expect(result).toContain('<div class="log-type-count">50</div>');
      expect(result).toContain('<div class="log-type-percentage">25%</div>');

      expect(result).toContain('console.warn');
      expect(result).toContain('<div class="log-type-count">30</div>');
      expect(result).toContain('<div class="log-type-percentage">15%</div>');

      // Check bar fills
      expect(result).toContain('width: 60%');
      expect(result).toContain('width: 25%');
      expect(result).toContain('width: 15%');
    });

    it('should render per-repository insights when logCount >= 50', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 100,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 100,
          totalFiles: 20,
          repositories: [
            {
              name: 'frontend',
              path: '/workspace/frontend',
              logCount: 60,
              fileCount: 12,
              topNestedFolder: {
                relativePath: 'src/components',
                logCount: 40,
                percentage: 67,
              },
            },
            {
              name: 'backend',
              path: '/workspace/backend',
              logCount: 40,
              fileCount: 8,
              topNestedFolder: {
                relativePath: 'api/routes',
                logCount: 25,
                percentage: 63,
              },
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check insights section exists (check for the actual h4 title, not just the comment)
      expect(result).toContain('🎯 Repository Insights');
      expect(result).toContain('impact-section');

      // Check file count cards
      expect(result).toContain('12');
      expect(result).toContain('frontend Files');
      expect(result).toContain('8');
      expect(result).toContain('backend Files');

      // Check hotspot cards
      expect(result).toContain('40');
      expect(result).toContain('Hotspot: src/components');
      expect(result).toContain('67% of frontend logs');

      expect(result).toContain('25');
      expect(result).toContain('Hotspot: api/routes');
      expect(result).toContain('63% of backend logs');

      // Check footer tip
      expect(result).toContain('Pro Tip:');
    });

    it('should NOT render insights section when logCount < 50', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 30,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 30,
          totalFiles: 10,
          repositories: [
            {
              name: 'small-repo',
              path: '/workspace/small-repo',
              logCount: 30,
              fileCount: 10,
              topNestedFolder: {
                relativePath: 'src',
                logCount: 20,
                percentage: 67,
              },
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Check insights section does NOT exist (check for actual rendered section, not comment)
      expect(result).not.toContain('🎯 Repository Insights');
      expect(result).not.toContain('impact-section');
      expect(result).not.toContain('Pro Tip:');
    });

    it('should handle repository without topNestedFolder gracefully', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 80,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 80,
          totalFiles: 15,
          repositories: [
            {
              name: 'flat-repo',
              path: '/workspace/flat-repo',
              logCount: 80,
              fileCount: 15,
              // No topNestedFolder
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Should show file count card
      expect(result).toContain('15');
      expect(result).toContain('flat-repo Files');

      // Should NOT show hotspot card
      expect(result).not.toContain('Hotspot:');
    });

    it('should escape HTML in repository names and paths', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 50,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 50,
          totalFiles: 10,
          repositories: [
            {
              name: '<script>alert("xss")</script>',
              path: '/workspace/<img src=x>',
              logCount: 50,
              fileCount: 10,
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Should escape HTML
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<img src=x>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;img src=x&gt;');
    });
  });

  describe('with no metadata scenario', () => {
    it('should render simple fallback when metadata is null', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 42,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights into your workspace logs.',
        metadata: null,
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Should show simple card with badge
      expect(result).toContain('class="workspace-analytics-card"');
      expect(result).toContain('42 Logs');
      expect(result).toContain('Your Workspace Analytics');
      expect(result).toContain('Real-time insights into your workspace logs.');

      // Should NOT contain advanced sections
      expect(result).not.toContain('Repositories Involved');
      expect(result).not.toContain('Log Type Distribution');
      expect(result).not.toContain('Repository Insights');
    });

    it('should render simple fallback when totalLogs is 0', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 0,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 0,
          totalFiles: 0,
          repositories: [],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Should show simple card
      expect(result).toContain('0 Logs');

      // Should NOT contain advanced sections
      expect(result).not.toContain('Repositories Involved');
      expect(result).not.toContain('Log Type Distribution');
    });

    it('should render simple fallback when metadata is undefined', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 10,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: undefined,
      };

      const result = renderWorkspaceLogCountComponent(component);

      // Should show simple card
      expect(result).toContain('10 Logs');

      // Should NOT contain advanced sections
      expect(result).not.toContain('Repositories Involved');
    });
  });

  describe('singular vs plural handling', () => {
    it('should use singular "Repository" when only 1 repository', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 50,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 50,
          totalFiles: 10,
          repositories: [
            {
              name: 'single-repo',
              path: '/workspace/single-repo',
              logCount: 50,
              fileCount: 10,
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      expect(result).toContain('1 Repository Involved');
      expect(result).not.toContain('Repositories'); // Check it's singular
    });

    it('should use plural "Repositories" when multiple repositories', () => {
      const component: WorkspaceLogCountComponent = {
        logCount: 100,
        title: 'Your Workspace Analytics',
        description: 'Real-time insights',
        metadata: {
          totalLogs: 100,
          totalFiles: 20,
          repositories: [
            {
              name: 'repo1',
              path: '/workspace/repo1',
              logCount: 60,
              fileCount: 12,
            },
            {
              name: 'repo2',
              path: '/workspace/repo2',
              logCount: 40,
              fileCount: 8,
            },
          ],
          logTypeDistribution: [],
        },
      };

      const result = renderWorkspaceLogCountComponent(component);

      expect(result).toContain('2 Repositories Involved');
    });
  });
});
