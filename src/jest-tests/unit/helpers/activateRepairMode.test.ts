import { activateRepairMode } from '../../../helpers/activateRepairMode';
import * as vscode from 'vscode';
import { ExtensionProperties } from '../../../entities';
import { TurboProBundleRepairPanel } from '../../../pro';
import * as proUtilities from '../../../pro/utilities';

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
}));

describe('activateRepairMode', () => {
  let mockContext: vscode.ExtensionContext;
  let mockConfig: ExtensionProperties;
  let mockTurboProBundleRepairPanel: TurboProBundleRepairPanel;

  beforeEach(() => {
    jest.clearAllMocks();

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
