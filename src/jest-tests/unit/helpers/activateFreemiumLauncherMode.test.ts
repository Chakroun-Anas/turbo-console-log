import { activateFreemiumLauncherMode } from '@/helpers/activateFreemiumLauncherMode';
import * as vscode from 'vscode';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';
import { TurboFreemiumLauncherPanel } from '@/pro/TurboFreemiumLauncherPanel';
import { activateFreemiumMode } from '@/helpers/activeFreemiumMode';
import { manageDynamicFreemiumPanel } from '@/helpers/activateFreemiumLauncherMode/launcherContent/manageDynamicFreemiumPanel';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { GlobalStateKeys } from '@/helpers/GlobalStateKeys';
import { createTelemetryService } from '@/telemetry/telemetryService';
import { trackPanelOpenings } from '@/helpers/trackPanelOpenings';

// Mock the dependencies
jest.mock('@/helpers/activeFreemiumMode');
jest.mock(
  '@/helpers/activateFreemiumLauncherMode/launcherContent/manageDynamicFreemiumPanel',
);
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/telemetry/telemetryService');
jest.mock('@/helpers/trackPanelOpenings');

const mockActivateFreemiumMode = activateFreemiumMode as jest.MockedFunction<
  typeof activateFreemiumMode
>;
const mockManageDynamicFreemiumPanel =
  manageDynamicFreemiumPanel as jest.MockedFunction<
    typeof manageDynamicFreemiumPanel
  >;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;
const mockTrackPanelOpenings = trackPanelOpenings as jest.MockedFunction<
  typeof trackPanelOpenings
>;

// Mock telemetry service
const mockTelemetryService = {
  reportFreemiumPanelOpening: jest.fn(),
  reportFreemiumPanelCtaClick: jest.fn(),
  reportFreshInstall: jest.fn(),
  reportUpdate: jest.fn(),
  reportCommandsInserted: jest.fn(),
  dispose: jest.fn(),
} as unknown as ReturnType<typeof createTelemetryService>;
const mockCreateTelemetryService =
  createTelemetryService as jest.MockedFunction<typeof createTelemetryService>;
mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

describe('activateFreemiumLauncherMode', () => {
  let consoleSpy: jest.SpyInstance;
  let context: vscode.ExtensionContext;
  let mockFreemiumLauncherProvider: TurboFreemiumLauncherPanel;
  let mockTreeView: jest.Mocked<vscode.TreeView<string>>;
  let mockVisibilityDisposable: jest.Mocked<vscode.Disposable>;
  let visibilityChangeHandler: (
    e: vscode.TreeViewVisibilityChangeEvent,
  ) => void;
  let createTreeViewSpy: jest.SpyInstance;
  let executeCommandSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();

    // Reset mock implementations to default behavior
    mockManageDynamicFreemiumPanel.mockImplementation(() => Promise.resolve());
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService);

    context = makeExtensionContext();

    mockFreemiumLauncherProvider = {
      getTreeItem: jest.fn(),
      getChildren: jest.fn(),
      refresh: jest.fn(),
      onDidChangeTreeData: jest.fn(),
    } as unknown as TurboFreemiumLauncherPanel;

    // Mock visibility change disposable
    mockVisibilityDisposable = {
      dispose: jest.fn(),
    } as jest.Mocked<vscode.Disposable>;

    // Mock tree view with proper badge and visibility handler capture
    mockTreeView = {
      badge: undefined,
      onDidChangeVisibility: jest
        .fn()
        .mockReturnValue(mockVisibilityDisposable),
      onDidExpandElement: jest.fn(),
      onDidCollapseElement: jest.fn(),
      onDidChangeCheckboxState: jest.fn(),
      dispose: jest.fn(),
      visible: false,
      selection: [],
      onDidChangeSelection: jest.fn(),
      reveal: jest.fn(),
      title: 'Test Tree',
      description: 'Test Description',
      message: 'Test Message',
    } as jest.Mocked<vscode.TreeView<string>>;

    // Capture the visibility change handler when it's registered
    mockTreeView.onDidChangeVisibility.mockImplementation((handler) => {
      visibilityChangeHandler = handler;
      return mockVisibilityDisposable;
    });

    // Mock VS Code API calls
    createTreeViewSpy = jest
      .spyOn(vscode.window, 'createTreeView')
      .mockReturnValue(mockTreeView);
    executeCommandSpy = jest
      .spyOn(vscode.commands, 'executeCommand')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Tree View Creation', () => {
    it('should create tree view with correct view type and provider', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(createTreeViewSpy).toHaveBeenCalledWith(
        TurboFreemiumLauncherPanel.viewType,
        {
          treeDataProvider: mockFreemiumLauncherProvider,
        },
      );
    });

    it('should initialize badge with correct default values', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(mockTreeView.badge).toEqual({
        value: 0,
        tooltip: 'New content in Turbo panel',
      });
    });

    it('should call manageDynamicFreemiumPanel with context and tree view', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(mockManageDynamicFreemiumPanel).toHaveBeenCalledWith(
        context,
        mockTreeView,
      );
    });
  });

  describe('Visibility Change Handler', () => {
    beforeEach(() => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
    });

    it('should register visibility change event handler', () => {
      expect(mockTreeView.onDidChangeVisibility).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should remove badge when view becomes visible', () => {
      mockTreeView.badge = { value: 1, tooltip: 'Test content' };

      visibilityChangeHandler({ visible: true });

      expect(mockTreeView.badge).toBeUndefined();
    });

    it('should write last access time to global state when view becomes visible', () => {
      const beforeTime = new Date().getTime();

      visibilityChangeHandler({ visible: true });

      const afterTime = new Date().getTime();

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      );

      // Verify the timestamp is reasonable (within test execution time)
      const writtenTime = new Date(
        mockWriteToGlobalState.mock.calls[0][2] as string,
      ).getTime();
      expect(writtenTime).toBeGreaterThanOrEqual(beforeTime);
      expect(writtenTime).toBeLessThanOrEqual(afterTime);
    });

    it('should call activateFreemiumMode when view becomes visible', () => {
      visibilityChangeHandler({ visible: true });

      expect(mockActivateFreemiumMode).toHaveBeenCalled();
    });

    it('should not process visibility change when view is not visible', () => {
      visibilityChangeHandler({ visible: false });

      expect(mockTreeView.badge).not.toBeUndefined();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockActivateFreemiumMode).not.toHaveBeenCalled();
    });

    it('should process visibility change correctly when launcher becomes visible', () => {
      // This tests the normal case - launcher becomes visible and activates freemium mode
      visibilityChangeHandler({ visible: true });

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
        expect.any(String),
      );
      expect(mockActivateFreemiumMode).toHaveBeenCalled();
    });

    it('should handle badge removal safely when badge is already undefined', () => {
      mockTreeView.badge = undefined;

      visibilityChangeHandler({ visible: true });

      expect(mockTreeView.badge).toBeUndefined();
      // Should not throw error
    });

    it('should report freemium panel opening when view becomes visible', () => {
      visibilityChangeHandler({ visible: true });

      // Should report panel opening via telemetry service
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalledWith();
    });

    it('should not report panel opening when view becomes hidden', () => {
      visibilityChangeHandler({ visible: false });

      // Should not report panel opening
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).not.toHaveBeenCalled();
    });

    it('should call trackPanelOpenings when view becomes visible', () => {
      visibilityChangeHandler({ visible: true });

      expect(mockTrackPanelOpenings).toHaveBeenCalledWith(context);
    });

    it('should not call trackPanelOpenings when view becomes hidden', () => {
      visibilityChangeHandler({ visible: false });

      expect(mockTrackPanelOpenings).not.toHaveBeenCalled();
    });

    it('should call trackPanelOpenings after telemetry and before activateFreemiumMode', () => {
      visibilityChangeHandler({ visible: true });

      // Verify all three are called
      expect(
        mockTelemetryService.reportFreemiumPanelOpening,
      ).toHaveBeenCalled();
      expect(mockTrackPanelOpenings).toHaveBeenCalled();
      expect(mockActivateFreemiumMode).toHaveBeenCalled();
    });
  });

  describe('Context Variable Management', () => {
    it('should set correct context variables for launcher mode', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(executeCommandSpy).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isPro',
        false,
      );
      expect(executeCommandSpy).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      );
      expect(executeCommandSpy).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isLauncherMode',
        true,
      );
      expect(executeCommandSpy).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      );
    });

    it('should set context variables in correct order', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      const calls = executeCommandSpy.mock.calls.filter(
        (call) =>
          call[0] === 'setContext' && call[1].startsWith('turboConsoleLog:'),
      );

      expect(calls).toHaveLength(4);
      expect(calls[0]).toEqual(['setContext', 'turboConsoleLog:isPro', false]);
      expect(calls[1]).toEqual([
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      ]);
      expect(calls[2]).toEqual([
        'setContext',
        'turboConsoleLog:isLauncherMode',
        true,
      ]);
      expect(calls[3]).toEqual([
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      ]);
    });
  });

  describe('Subscription Management', () => {
    it('should add visibility disposable to context subscriptions', () => {
      const initialSubscriptionsLength = context.subscriptions.length;

      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(context.subscriptions.length).toBe(initialSubscriptionsLength + 1);
      expect(context.subscriptions).toContain(mockVisibilityDisposable);
    });
  });

  describe('Error Handling', () => {
    it('should handle createTreeView errors gracefully', () => {
      createTreeViewSpy.mockImplementation(() => {
        throw new Error('Failed to create tree view');
      });

      expect(() => {
        activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
      }).toThrow('Failed to create tree view');
    });

    it('should handle manageDynamicFreemiumPanel errors gracefully', () => {
      mockManageDynamicFreemiumPanel.mockImplementation(() => {
        throw new Error('Dynamic panel error');
      });

      expect(() => {
        activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
      }).toThrow('Dynamic panel error');
    });

    it('should handle context command execution errors', () => {
      executeCommandSpy.mockImplementation(() => {
        throw new Error('Command execution failed');
      });

      // The function will throw if executeCommand throws
      expect(() => {
        activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
      }).toThrow('Command execution failed');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete activation flow', () => {
      // Activate launcher mode
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      // Verify initial state
      expect(mockTreeView.badge).toEqual({
        value: 0,
        tooltip: 'New content in Turbo panel',
      });
      expect(mockManageDynamicFreemiumPanel).toHaveBeenCalledWith(
        context,
        mockTreeView,
      );

      // Simulate user viewing the panel
      visibilityChangeHandler({ visible: true });

      // Verify post-visibility state
      expect(mockTreeView.badge).toBeUndefined();
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
        expect.any(String),
      );
      expect(mockActivateFreemiumMode).toHaveBeenCalled();
    });

    it('should handle visibility changes correctly including false values', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      // Test that visible: false is ignored
      visibilityChangeHandler({ visible: false });
      expect(mockActivateFreemiumMode).not.toHaveBeenCalled();
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();

      // Test that visible: true triggers the activation
      visibilityChangeHandler({ visible: true });
      expect(mockActivateFreemiumMode).toHaveBeenCalledTimes(1);
      expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple independent function calls', () => {
      // First call
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
      expect(createTreeViewSpy).toHaveBeenCalledTimes(1);

      // Second call creates a new tree view (each call is independent)
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);
      expect(createTreeViewSpy).toHaveBeenCalledTimes(2); // Called twice independently
    });
  });

  describe('TurboFreemiumLauncherPanel Integration', () => {
    it('should use TurboFreemiumLauncherPanel.viewType for tree view creation', () => {
      // Mock the static property
      const originalViewType = TurboFreemiumLauncherPanel.viewType;
      Object.defineProperty(TurboFreemiumLauncherPanel, 'viewType', {
        value: 'test.turbo.launcher',
        writable: true,
        configurable: true,
      });

      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(createTreeViewSpy).toHaveBeenCalledWith(
        'test.turbo.launcher',
        expect.any(Object),
      );

      // Restore original value
      Object.defineProperty(TurboFreemiumLauncherPanel, 'viewType', {
        value: originalViewType,
        writable: true,
        configurable: true,
      });
    });

    it('should pass the provider instance to createTreeView', () => {
      activateFreemiumLauncherMode(context, mockFreemiumLauncherProvider);

      expect(createTreeViewSpy).toHaveBeenCalledWith(expect.any(String), {
        treeDataProvider: mockFreemiumLauncherProvider,
      });
    });
  });
});
