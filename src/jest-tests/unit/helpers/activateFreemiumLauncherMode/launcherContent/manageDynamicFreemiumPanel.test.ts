import { manageDynamicFreemiumPanel } from '@/helpers/activateFreemiumLauncherMode/launcherContent/manageDynamicFreemiumPanel';
import * as vscode from 'vscode';
import axios from 'axios';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { GlobalStateKeys } from '@/helpers/GlobalStateKeys';
import { shouldShowBadge } from '@/helpers/activateFreemiumLauncherMode/launcherContent/shouldShowBadge';

// Mock all dependencies
jest.mock('axios');
jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock(
  '@/helpers/activateFreemiumLauncherMode/launcherContent/shouldShowBadge',
);

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockShouldShowBadge = shouldShowBadge as jest.MockedFunction<
  typeof shouldShowBadge
>;

describe('manageDynamicFreemiumPanel', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let mockContext: vscode.ExtensionContext;
  let mockTreeView: jest.Mocked<vscode.TreeView<string>>;
  let mockConfig: jest.Mocked<vscode.WorkspaceConfiguration>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.clearAllMocks();

    // Mock VS Code context
    mockContext = {} as vscode.ExtensionContext;

    // Mock TreeView
    mockTreeView = {
      badge: undefined,
    } as jest.Mocked<vscode.TreeView<string>>;

    // Mock VS Code configuration
    mockConfig = {
      get: jest.fn(),
    } as unknown as jest.Mocked<vscode.WorkspaceConfiguration>;

    // Mock VS Code workspace configuration
    jest
      .spyOn(vscode.workspace, 'getConfiguration')
      .mockReturnValue(mockConfig);
    mockConfig.get.mockReturnValue(true); // Default: enabled

    // Default mock values
    mockReadFromGlobalState.mockReturnValue(undefined);
    mockShouldShowBadge.mockReturnValue(false);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Configuration Handling', () => {
    it('should exit early when dynamic freemium panel is disabled', async () => {
      mockConfig.get.mockReturnValue(false);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockConfig.get).toHaveBeenCalledWith('dynamicFreemiumPanel', true);
      expect(mockReadFromGlobalState).not.toHaveBeenCalled();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should proceed when dynamic freemium panel is enabled', async () => {
      mockConfig.get.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockConfig.get).toHaveBeenCalledWith('dynamicFreemiumPanel', true);
      expect(mockReadFromGlobalState).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should use cached content when within 24-hour window', async () => {
      const now = new Date();
      const recentFetch = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

      mockReadFromGlobalState
        .mockReturnValueOnce(recentFetch.toISOString()) // Last fetch date
        .mockReturnValueOnce({ date: '2025-09-27', tooltip: 'Cached content' }) // Existing content
        .mockReturnValueOnce('2025-09-26'); // Last panel access

      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Dynamic freemium content cache still valid, skipping API call. Last fetch:',
        recentFetch,
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(mockTreeView.badge).toEqual({
        value: 1,
        tooltip: 'Cached content',
      });
    });

    it('should fetch new content when cache is expired', async () => {
      const now = new Date();
      const expiredFetch = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago

      mockReadFromGlobalState.mockReturnValue(expiredFetch.toISOString());

      const mockResponse = {
        data: {
          date: '2025-09-27',
          tooltip: 'Fresh content',
          content: [],
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockShouldShowBadge.mockReturnValue(false);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Fetching dynamic freemium content from API...',
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/dynamicFreemiumPanel',
        { timeout: 10000 },
      );
    });

    it('should fetch content on first run when no cache exists', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: {
          date: '2025-09-27',
          tooltip: 'First time content',
          content: [],
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        mockResponse.data,
      );
    });
  });

  describe('API Integration', () => {
    it('should make API call with correct URL and timeout', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: { date: '2025-09-27', tooltip: 'API content', content: [] },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/dynamicFreemiumPanel',
        { timeout: 10000 },
      );
    });

    it('should handle API errors gracefully', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const apiError = new Error('Network timeout');
      mockedAxios.get.mockRejectedValue(apiError);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch dynamic freemium content:',
        apiError,
      );
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockTreeView.badge).toBeUndefined();
    });
  });

  describe('Content Change Detection', () => {
    it('should update storage when content date changes', async () => {
      const oldContent = { date: '2025-09-25' };
      mockReadFromGlobalState
        .mockReturnValueOnce(undefined) // No last fetch (will trigger API call)
        .mockReturnValueOnce(oldContent); // Previous content

      const newContent = {
        date: '2025-09-27',
        tooltip: 'Updated content',
        content: [],
      };
      mockedAxios.get.mockResolvedValue({ data: newContent });
      mockShouldShowBadge.mockReturnValue(false);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        newContent,
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Dynamic freemium content updated with new date:',
        new Date(newContent.date),
      );
    });

    it('should skip storage update when content date is unchanged', async () => {
      const existingContent = { date: '2025-09-27' };
      mockReadFromGlobalState
        .mockReturnValueOnce(undefined) // No last fetch
        .mockReturnValueOnce(existingContent); // Previous content

      const sameContent = {
        date: '2025-09-27',
        tooltip: 'Same content',
        content: [],
      };
      mockedAxios.get.mockResolvedValue({ data: sameContent });

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        expect.anything(),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Dynamic freemium content unchanged, badge state preserved from previous cycles',
      );
    });
  });

  describe('Badge Management', () => {
    it('should show badge when shouldShowBadge returns true', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: {
          date: '2025-09-27',
          tooltip: 'New content available',
          content: [],
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockTreeView.badge).toEqual({
        value: 1,
        tooltip: 'New content available',
      });
    });

    it('should not show badge when content unchanged and shouldShowBadge returns false', async () => {
      // Mock existing content with same date
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT) {
          return { date: '2025-09-27', tooltip: 'Existing content' };
        }
        return undefined;
      });

      const mockResponse = {
        data: {
          date: '2025-09-27', // Same date as existing
          tooltip: 'Already seen content',
          content: [],
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockShouldShowBadge.mockReturnValue(false);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      // Badge should not be set when content is unchanged
      expect(mockTreeView.badge).toBeUndefined();
    });

    it('should use default tooltip when none provided', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: {
          date: '2025-09-27',
          content: [],
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockTreeView.badge).toEqual({
        value: 1,
        tooltip: 'New content in Turbo panel',
      });
    });

    it('should handle undefined launcherView gracefully', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: { date: '2025-09-27', tooltip: 'Content', content: [] },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Test with undefined launcherView
      await manageDynamicFreemiumPanel(mockContext, undefined);

      // Should not crash but won't update storage due to launcherView check
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('Global State Management', () => {
    it('should read all required global state keys', async () => {
      const now = new Date();
      const recentFetch = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      mockReadFromGlobalState
        .mockReturnValueOnce(recentFetch.toISOString())
        .mockReturnValueOnce({ date: '2025-09-27', tooltip: 'Content' })
        .mockReturnValueOnce('2025-09-26');

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_FETCH,
      );
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
      );
      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
      );
    });

    it('should update last fetch date after successful API call', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const mockResponse = {
        data: { date: '2025-09-27', tooltip: 'Content', content: [] },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_FETCH,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/), // ISO string format
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed cache date gracefully', async () => {
      mockReadFromGlobalState.mockReturnValue('invalid-date');

      const mockResponse = {
        data: { date: '2025-09-27', tooltip: 'Content', content: [] },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      // Should proceed to make API call when cache date is invalid
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should handle missing response data gracefully', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      // API returns empty response
      mockedAxios.get.mockResolvedValue({});

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        expect.anything(),
      );
    });

    it('should handle network timeout specifically', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const timeoutError = new Error('timeout of 10000ms exceeded');
      mockedAxios.get.mockRejectedValue(timeoutError);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch dynamic freemium content:',
        timeoutError,
      );
    });

    it('should handle shouldShowBadge function calls correctly', async () => {
      const now = new Date();
      const recentFetch = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const contentDate = '2025-09-27';
      const lastAccess = '2025-09-26';

      mockReadFromGlobalState
        .mockReturnValueOnce(recentFetch.toISOString())
        .mockReturnValueOnce({ date: contentDate, tooltip: 'Test' })
        .mockReturnValueOnce(lastAccess);

      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      expect(mockShouldShowBadge).toHaveBeenCalledWith(contentDate, lastAccess);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete fresh install flow', async () => {
      // Simulate fresh install - no cache, no previous content
      mockReadFromGlobalState.mockReturnValue(undefined);

      const freshContent = {
        date: '2025-09-27',
        tooltip: 'Welcome to Turbo Console Log Pro!',
        content: [{ type: 'paragraph', component: { title: 'Welcome' } }],
      };
      mockedAxios.get.mockResolvedValue({ data: freshContent });
      mockShouldShowBadge.mockReturnValue(true);

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      // Should fetch from API
      expect(mockedAxios.get).toHaveBeenCalled();

      // Should store new content
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        freshContent,
      );

      // Should update fetch date
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_FETCH,
        expect.any(String),
      );

      // Should show badge
      expect(mockTreeView.badge).toEqual({
        value: 1,
        tooltip: 'Welcome to Turbo Console Log Pro!',
      });
    });

    it('should handle returning user with seen content', async () => {
      // Simulate returning user with recent cache and already seen content
      const now = new Date();
      const recentFetch = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
      const contentDate = '2025-09-27';
      const recentAccess = new Date().toISOString(); // Just accessed

      mockReadFromGlobalState
        .mockReturnValueOnce(recentFetch.toISOString())
        .mockReturnValueOnce({ date: contentDate, tooltip: 'Existing content' })
        .mockReturnValueOnce(recentAccess);

      mockShouldShowBadge.mockReturnValue(false); // Already seen

      await manageDynamicFreemiumPanel(mockContext, mockTreeView);

      // Should use cache
      expect(mockedAxios.get).not.toHaveBeenCalled();

      // Should not show badge
      expect(mockTreeView.badge).toBeUndefined();
    });
  });
});
