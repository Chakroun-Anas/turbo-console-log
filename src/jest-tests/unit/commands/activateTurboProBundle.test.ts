import * as vscode from 'vscode';
import { activateTurboProBundleCommand } from '@/commands/activateTurboProBundle';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import { showNotification } from '@/ui';
import * as proUtilities from '@/pro/utilities';
import { isOnline } from '@/pro/utilities/isOnline';
import { writeToGlobalState } from '@/helpers';
import { AxiosError } from 'axios';

// Mock the dependencies
jest.mock('@/ui');
jest.mock('@/pro/utilities');
jest.mock('@/pro/utilities/isOnline');
jest.mock('@/helpers');

describe('activateTurboProBundleCommand', () => {
  const mockContext = makeExtensionContext();
  const mockExtensionProperties = {} as ExtensionProperties;
  const mockDebugMessage = makeDebugMessage();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Default mocks
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
      'TCLP-TESTKEY12345678901234567890AB',
    );
    (isOnline as jest.Mock).mockResolvedValue(true);
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: { version: '3.3.0' },
    });
  });

  describe('license key input handling', () => {
    it('should reject license key without TCLP- prefix', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'invalid-key-without-prefix',
      );
      (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue('Cancel');

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '❌ Invalid license key format. License keys start with "TCLP-"',
        'Try Again',
        'Cancel',
      );
      expect(proUtilities.fetchProBundle).not.toHaveBeenCalled();
    });

    it('should reject license key with TCLP- prefix and retry', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'wrong-prefix-key',
      );
      (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue(
        'Try Again',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '❌ Invalid license key format. License keys start with "TCLP-"',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.activateTurboProBundle',
      );
    });

    it('should handle empty license key input with cancellation', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('');
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Cancel',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Pro Activation cancelled — no license key entered!',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should handle empty license key input with retry', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('');
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Try Again',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Pro Activation cancelled — no license key entered!',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.activateTurboProBundle',
      );
    });

    it('should handle undefined license key input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Cancel',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Pro Activation cancelled — no license key entered!',
        'Try Again',
        'Cancel',
      );
    });

    it('should trim whitespace from license key', async () => {
      const licenseKeyWithSpaces = '  TCLP-TESTKEY12345678901234567890AB  ';
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        licenseKeyWithSpaces,
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(
        'mock-bundle',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchProBundle).toHaveBeenCalledWith(
        'TCLP-TESTKEY12345678901234567890AB',
        '3.3.0',
      );
    });
  });

  describe('internet connection handling', () => {
    it('should show error message when offline', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (isOnline as jest.Mock).mockResolvedValue(false);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '📡 No internet connection. Please connect and try again.',
      );
      expect(proUtilities.fetchProBundle).not.toHaveBeenCalled();
    });
  });

  describe('successful activation', () => {
    it('should successfully activate pro bundle', async () => {
      const mockBundle = 'mock-pro-bundle';
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchProBundle).toHaveBeenCalledWith(
        'TCLP-TESTKEY12345678901234567890AB',
        '3.3.0',
      );
      expect(proUtilities.runProBundle).toHaveBeenCalledWith(
        mockExtensionProperties,
        mockBundle,
        mockContext,
      );
      expect(proUtilities.writeProBundleToCache).toHaveBeenCalledWith(
        mockContext,
        'TCLP-TESTKEY12345678901234567890AB',
        mockBundle,
        '3.3.0',
      );
      expect(showNotification).toHaveBeenCalledWith(
        '🎉 Turbo Console Log Pro Activated, reload your window please!',
        10000,
      );
    });
  });

  describe('error handling', () => {
    it('should handle AxiosError with response data', async () => {
      const errorMessage = 'Invalid license key';
      const axiosError = new AxiosError('Request failed');
      (axiosError as unknown as { response: unknown }).response = {
        data: {
          error: errorMessage,
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {},
      };

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-INVALIDKEY1234567890123456789',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockRejectedValue(axiosError);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(errorMessage);
      expect(console.error).toHaveBeenCalledWith(
        'Turbo Pro activation failed: ',
        axiosError,
      );
    });

    it('should handle AxiosError without response data', async () => {
      const axiosError = new AxiosError('Request failed');
      (axiosError as unknown as { response: unknown }).response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      };

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-INVALIDKEY1234567890123456789',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockRejectedValue(axiosError);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Something went wrong, please contact the support at support@turboconsolelog.io',
      );
    });

    it('should handle non-AxiosError', async () => {
      const genericError = new Error('Network error');

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockRejectedValue(
        genericError,
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(showNotification).toHaveBeenCalledWith(
        'Something went wrong, please contact the support at support@turboconsolelog.io',
        5000,
      );
      expect(console.error).toHaveBeenCalledWith(
        'Turbo Pro activation failed: ',
        genericError,
      );
    });

    it('should handle missing extension', async () => {
      (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(
        'mock-bundle',
      );

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchProBundle).toHaveBeenCalledWith(
        'TCLP-TESTKEY12345678901234567890AB',
        undefined,
      );
    });
  });

  describe('trial metadata cleanup', () => {
    it('should clear trial metadata when Pro is successfully activated', async () => {
      const mockBundle = 'mock-pro-bundle';
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      // Verify all three trial metadata keys are cleared
      expect(writeToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'trial-key',
        undefined,
      );
      expect(writeToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'trial-expires-at',
        undefined,
      );
      expect(writeToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'trial-status',
        undefined,
      );
    });

    it('should NOT clear trial metadata when Pro activation fails', async () => {
      const axiosError = new AxiosError('Invalid license key');
      (axiosError as unknown as { response: unknown }).response = {
        data: { error: 'Invalid license key' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {},
      };

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-INVALIDKEY1234567890123456789',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockRejectedValue(axiosError);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      // Trial metadata should NOT be cleared when activation fails
      expect(writeToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'trial-key',
        undefined,
      );
      expect(writeToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'trial-expires-at',
        undefined,
      );
      expect(writeToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'trial-status',
        undefined,
      );
    });

    it('should NOT clear trial metadata when offline', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (isOnline as jest.Mock).mockResolvedValue(false);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      // Trial metadata should NOT be cleared when offline
      expect(writeToGlobalState).not.toHaveBeenCalled();
    });

    it('should clear trial metadata before running Pro bundle', async () => {
      const mockBundle = 'mock-pro-bundle';
      const callOrder: string[] = [];

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      // Track call order
      (writeToGlobalState as jest.Mock).mockImplementation(() => {
        callOrder.push('writeToGlobalState');
      });
      (proUtilities.runProBundle as jest.Mock).mockImplementation(() => {
        callOrder.push('runProBundle');
      });

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      // Trial cleanup should happen before runProBundle
      expect(callOrder.indexOf('writeToGlobalState')).toBeLessThan(
        callOrder.indexOf('runProBundle'),
      );
    });
  });

  describe('launcher view badge clearing', () => {
    it('should clear launcher view badge when provided', async () => {
      const mockBundle = 'mock-pro-bundle';
      const mockLauncherView = {
        badge: { value: 1000, tooltip: 'Total logs' },
      } as vscode.TreeView<unknown>;

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
        launcherView: mockLauncherView,
      });

      expect(mockLauncherView.badge).toBeUndefined();
    });

    it('should not crash when launcher view is undefined', async () => {
      const mockBundle = 'mock-pro-bundle';
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      const command = activateTurboProBundleCommand();

      // Should not throw when launcherView is undefined
      await expect(
        command.handler({
          context: mockContext,
          extensionProperties: mockExtensionProperties,
          debugMessage: mockDebugMessage,
          launcherView: undefined,
        }),
      ).resolves.not.toThrow();

      expect(proUtilities.runProBundle).toHaveBeenCalled();
    });

    it('should clear badge before trial metadata cleanup', async () => {
      const mockBundle = 'mock-pro-bundle';
      const callOrder: string[] = [];
      const mockLauncherView = {
        badge: { value: 1000, tooltip: 'Total logs' },
      } as vscode.TreeView<unknown>;

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-TESTKEY12345678901234567890AB',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      // Track call order using a getter
      let badgeCleared = false;
      Object.defineProperty(mockLauncherView, 'badge', {
        get: () => undefined,
        set: (value) => {
          if (value === undefined) {
            badgeCleared = true;
            callOrder.push('badge-cleared');
          }
        },
      });

      (writeToGlobalState as jest.Mock).mockImplementation(() => {
        if (badgeCleared) {
          callOrder.push('writeToGlobalState');
        }
      });

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
        launcherView: mockLauncherView,
      });

      // Badge should be cleared before trial metadata cleanup
      expect(callOrder[0]).toBe('badge-cleared');
      expect(callOrder).toContain('writeToGlobalState');
    });

    it('should NOT clear badge when activation fails', async () => {
      const axiosError = new AxiosError('Invalid license key');
      (axiosError as unknown as { response: unknown }).response = {
        data: { error: 'Invalid license key' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {},
      };

      const mockLauncherView = {
        badge: { value: 1000, tooltip: 'Total logs' },
      } as vscode.TreeView<unknown>;

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-INVALIDKEY1234567890123456789',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockRejectedValue(axiosError);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
        launcherView: mockLauncherView,
      });

      // Badge should remain unchanged when activation fails
      expect(mockLauncherView.badge).toEqual({
        value: 1000,
        tooltip: 'Total logs',
      });
    });
  });

  describe('command registration', () => {
    it('should return correct command name', () => {
      const command = activateTurboProBundleCommand();
      expect(command.name).toBe('turboConsoleLog.activateTurboProBundle');
    });

    it('should have a handler function', () => {
      const command = activateTurboProBundleCommand();
      expect(typeof command.handler).toBe('function');
    });
  });
});
