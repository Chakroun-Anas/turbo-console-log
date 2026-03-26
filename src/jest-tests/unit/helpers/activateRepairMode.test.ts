import { activateRepairMode } from '../../../helpers/activateRepairMode';
import * as vscode from 'vscode';
import { ExtensionProperties } from '../../../entities';
import { TurboProBundleRepairPanel } from '../../../pro';
import * as proUtilities from '../../../pro/utilities';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Mock VSCode API
const mockCommands = {
  executeCommand: jest.fn(),
  registerCommand: jest.fn(),
  getCommands: jest.fn(),
};

Object.defineProperty(vscode, 'commands', {
  value: mockCommands,
  configurable: true,
});

// Mock Pro utilities
jest.mock('../../../pro/utilities', () => ({
  updateProBundle: jest.fn(),
  runProBundle: jest.fn(),
  fetchTrialBundle: jest.fn(),
}));

// Mock TrialCountdownTimer
jest.mock('../../../pro/TrialCountdownTimer', () => ({
  TrialCountdownTimer: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  })),
  createTrialExpiredStatusBar: jest.fn(() => ({
    show: jest.fn(),
    dispose: jest.fn(),
  })),
}));

// Mock writeToGlobalState helper
jest.mock('../../../helpers/writeToGlobalState', () => ({
  writeToGlobalState: jest.fn(),
}));

// Mock vscode.window
const mockWindow = {
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn(),
};

Object.defineProperty(vscode, 'window', {
  value: mockWindow,
  configurable: true,
});

describe('activateRepairMode', () => {
  let mockContext: vscode.ExtensionContext;
  let mockConfig: ExtensionProperties;
  let mockTurboProBundleRepairPanel: TurboProBundleRepairPanel;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Suppress console output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as vscode.ExtensionContext;

    mockConfig = {} as ExtensionProperties;

    mockTurboProBundleRepairPanel = {
      updateView: jest.fn(),
    } as unknown as TurboProBundleRepairPanel;

    // Default mock for getCommands to return empty array (no existing commands)
    mockCommands.getCommands.mockResolvedValue([]);
  });

  afterEach(() => {
    // Restore console methods after each test
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('update mode', () => {
    it('should activate repair mode and set context for update scenario', () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed due to network error',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Should set repair mode context
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        true,
      );

      // Should set initialized context
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      );

      // Should update the repair panel with update mode and reason
      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'update',
        'Update failed due to network error',
      );
    });

    it('should register retry pro update command for update mode', async () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should register the retry update command
      expect(mockCommands.registerCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryProUpdate',
        expect.any(Function),
      );
    });

    it('should not register command if it already exists for update mode', async () => {
      // Mock that the command already exists
      mockCommands.getCommands.mockResolvedValue([
        'turboConsoleLog.retryProUpdate',
      ]);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Should not register the command again
      expect(mockCommands.registerCommand).not.toHaveBeenCalledWith(
        'turboConsoleLog.retryProUpdate',
        expect.any(Function),
      );
    });

    it('should retry update when retry command is executed', async () => {
      const updateProBundleMock = jest.mocked(proUtilities.updateProBundle);
      updateProBundleMock.mockResolvedValueOnce(undefined);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Get the registered command handler
      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryProUpdate',
      );
      expect(registerCall).toBeDefined();

      const retryHandler = registerCall?.[1];
      await retryHandler();

      // Should call updateProBundle with correct parameters
      expect(updateProBundleMock).toHaveBeenCalledWith(
        mockContext,
        '3.4.0',
        'test-license-key',
        mockConfig,
      );
    });

    it('should update repair panel view if retry update fails', async () => {
      const updateProBundleMock = jest.mocked(proUtilities.updateProBundle);
      const updateError = new Error('Network timeout');
      updateProBundleMock.mockRejectedValueOnce(updateError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Get the registered command handler
      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryProUpdate',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      // Should update the repair panel with the new error
      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'update',
        'Network timeout',
      );
    });
  });

  describe('run mode', () => {
    it('should activate repair mode and set context for run scenario', () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'run',
        proBundle: 'test-bundle-code',
      });

      // Should set repair mode context
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        true,
      );

      // Should set initialized context
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      );

      // Should update the repair panel with run mode and reason
      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'run',
        'Bundle execution failed',
      );
    });

    it('should register retry pro bundle run command for run mode', async () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'run',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should register the retry run command
      expect(mockCommands.registerCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryProBundleRun',
        expect.any(Function),
      );
    });

    it('should not register command if it already exists for run mode', async () => {
      // Mock that the command already exists
      mockCommands.getCommands.mockResolvedValue([
        'turboConsoleLog.retryProBundleRun',
      ]);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'run',
        proBundle: 'test-bundle-code',
      });

      // Should not register the command again
      expect(mockCommands.registerCommand).not.toHaveBeenCalledWith(
        'turboConsoleLog.retryProBundleRun',
        expect.any(Function),
      );
    });

    it('should retry bundle run when retry command is executed', async () => {
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);
      runProBundleMock.mockResolvedValueOnce(undefined);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'run',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Get the registered command handler
      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryProBundleRun',
      );
      expect(registerCall).toBeDefined();

      const retryHandler = registerCall?.[1];
      await retryHandler();

      // Should call runProBundle with correct parameters
      expect(runProBundleMock).toHaveBeenCalledWith(
        mockConfig,
        'test-bundle-code',
        mockContext,
      );
    });

    it('should update repair panel view if retry run fails', async () => {
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);
      const runError = new Error('Bundle is corrupted');
      runProBundleMock.mockRejectedValueOnce(runError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'run',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Get the registered command handler
      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryProBundleRun',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      // Should update the repair panel with the new error
      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'run',
        'Bundle is corrupted',
      );
    });
  });

  describe('trial-fetch mode', () => {
    it('should activate repair mode and set context for trial-fetch scenario', () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error fetching trial bundle',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        true,
      );

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      );

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-fetch',
        'Network error fetching trial bundle',
      );
    });

    it('should register retry trial fetch command', async () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCommands.registerCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryTrialFetch',
        expect.any(Function),
      );
    });

    it('should not register command if it already exists', async () => {
      mockCommands.getCommands.mockResolvedValue([
        'turboConsoleLog.retryTrialFetch',
      ]);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      expect(mockCommands.registerCommand).not.toHaveBeenCalledWith(
        'turboConsoleLog.retryTrialFetch',
        expect.any(Function),
      );
    });

    it('should successfully fetch and run trial bundle on retry', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);

      const mockExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      fetchTrialBundleMock.mockResolvedValueOnce({
        bundle: 'trial-bundle-code',
        expiresAt: mockExpiresAt,
      });
      runProBundleMock.mockResolvedValueOnce(undefined);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(fetchTrialBundleMock).toHaveBeenCalledWith(
        'TRIAL-TEST123',
        '3.4.0',
      );
      expect(runProBundleMock).toHaveBeenCalledWith(
        mockConfig,
        'trial-bundle-code',
        mockContext,
      );

      // Should exit repair mode on success
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      );
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isPro',
        true,
      );
    });

    it('should handle expired trial on retry', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;

      const mockExpiresAt = new Date(Date.now() - 1000); // Expired
      fetchTrialBundleMock.mockResolvedValueOnce({
        bundle: 'trial-bundle-code',
        expiresAt: mockExpiresAt,
      });

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        '❌ Trial has expired. Please request a new trial or upgrade to Pro.',
      );
    });

    it('should handle run error after successful fetch', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);

      const mockExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      fetchTrialBundleMock.mockResolvedValueOnce({
        bundle: 'trial-bundle-code',
        expiresAt: mockExpiresAt,
      });
      runProBundleMock.mockRejectedValueOnce(new Error('Bundle corrupted'));

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-fetch',
        'Bundle execution error: Bundle corrupted',
      );
    });

    it('should handle 403 error (permanent trial issue)', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;

      const axiosError = new AxiosError(
        'Trial key already used on another machine',
        '403',
        undefined,
        undefined,
        {
          status: 403,
          statusText: 'Forbidden',
          data: { error: 'Trial key already used on another machine' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      );
      fetchTrialBundleMock.mockRejectedValueOnce(axiosError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        '❌ Trial key already used on another machine',
      );
    });

    it('should handle 500 error (server issue)', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;

      const axiosError = new AxiosError(
        'Internal server error',
        '500',
        undefined,
        undefined,
        {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: 'Internal server error' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      );
      fetchTrialBundleMock.mockRejectedValueOnce(axiosError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-fetch',
        'Internal server error',
      );
    });

    it('should handle network error', async () => {
      const fetchTrialBundleMock = jest.mocked(
        proUtilities.fetchTrialBundle,
      ) as jest.MockedFunction<typeof proUtilities.fetchTrialBundle>;

      const networkError = { code: 'ENOTFOUND' };
      fetchTrialBundleMock.mockRejectedValueOnce(networkError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Network error',
        mode: 'trial-fetch',
        trialKey: 'TRIAL-TEST123',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialFetch',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-fetch',
        'ENOTFOUND',
      );
    });
  });

  describe('trial-run mode', () => {
    it('should activate repair mode and set context for trial-run scenario', () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'trial-run',
        trialBundle: 'trial-bundle-code',
      });

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        true,
      );

      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isInitialized',
        true,
      );

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-run',
        'Bundle execution failed',
      );
    });

    it('should register retry trial run command', async () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'trial-run',
        trialBundle: 'trial-bundle-code',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCommands.registerCommand).toHaveBeenCalledWith(
        'turboConsoleLog.retryTrialRun',
        expect.any(Function),
      );
    });

    it('should not register command if it already exists', async () => {
      mockCommands.getCommands.mockResolvedValue([
        'turboConsoleLog.retryTrialRun',
      ]);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'trial-run',
        trialBundle: 'trial-bundle-code',
      });

      expect(mockCommands.registerCommand).not.toHaveBeenCalledWith(
        'turboConsoleLog.retryTrialRun',
        expect.any(Function),
      );
    });

    it('should successfully run trial bundle on retry', async () => {
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);
      runProBundleMock.mockResolvedValueOnce(undefined);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'trial-run',
        trialBundle: 'trial-bundle-code',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialRun',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(runProBundleMock).toHaveBeenCalledWith(
        mockConfig,
        'trial-bundle-code',
        mockContext,
      );

      // Should exit repair mode and show success
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isRepairMode',
        false,
      );
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'turboConsoleLog:isPro',
        true,
      );
      expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
        '✅ Trial bundle running successfully! Pro features are now active.',
      );
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'workbench.action.reloadWindow',
      );
    });

    it('should update repair panel if retry run fails', async () => {
      const runProBundleMock = jest.mocked(proUtilities.runProBundle);
      const runError = new Error('Bundle execution error');
      runProBundleMock.mockRejectedValueOnce(runError);

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Bundle execution failed',
        mode: 'trial-run',
        trialBundle: 'trial-bundle-code',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryTrialRun',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'trial-run',
        'Bundle execution error',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle errors without message property', async () => {
      const updateProBundleMock = jest.mocked(proUtilities.updateProBundle);
      updateProBundleMock.mockRejectedValueOnce({}); // Error without message

      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: 'Update failed',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      // Wait for async command registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      const registerCall = mockCommands.registerCommand.mock.calls.find(
        ([commandName]) => commandName === 'turboConsoleLog.retryProUpdate',
      );
      const retryHandler = registerCall?.[1];
      await retryHandler();

      // Should handle missing error message gracefully
      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'update',
        '', // Empty string when no message
      );
    });

    it('should throw error for unknown repair mode', () => {
      expect(() => {
        activateRepairMode({
          context: mockContext,
          version: '3.4.0',
          proLicenseKey: 'test-license-key',
          config: mockConfig,
          turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
          reason: 'Unknown error',
          mode: 'invalid' as 'update' | 'run',
          proBundle: 'test-bundle-code',
        });
      }).toThrow('Unknown repair mode: invalid');
    });

    it('should handle empty reason string', () => {
      activateRepairMode({
        context: mockContext,
        version: '3.4.0',
        proLicenseKey: 'test-license-key',
        config: mockConfig,
        turboProBundleRepairPanel: mockTurboProBundleRepairPanel,
        reason: '',
        mode: 'update',
        proBundle: 'test-bundle-code',
      });

      expect(mockTurboProBundleRepairPanel.updateView).toHaveBeenCalledWith(
        'update',
        '',
      );
    });
  });
});
