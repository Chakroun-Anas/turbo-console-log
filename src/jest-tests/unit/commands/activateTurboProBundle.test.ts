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
import { AxiosError } from 'axios';

// Mock the dependencies
jest.mock('@/ui');
jest.mock('@/pro/utilities');
jest.mock('@/pro/utilities/isOnline');

describe('activateTurboProBundleCommand', () => {
  const mockContext = makeExtensionContext();
  const mockExtensionProperties = {} as ExtensionProperties;
  const mockDebugMessage = makeDebugMessage();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Default mocks
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
      'test-license-key',
    );
    (isOnline as jest.Mock).mockResolvedValue(true);
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: { version: '3.3.0' },
    });
  });

  describe('license key input handling', () => {
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
      const licenseKeyWithSpaces = '  test-license-key  ';
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
        'test-license-key',
        '3.3.0',
      );
    });
  });

  describe('internet connection handling', () => {
    it('should show error message when offline', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'test-license-key',
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
        'test-license-key',
      );
      (proUtilities.fetchProBundle as jest.Mock).mockResolvedValue(mockBundle);

      const command = activateTurboProBundleCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchProBundle).toHaveBeenCalledWith(
        'test-license-key',
        '3.3.0',
      );
      expect(proUtilities.runProBundle).toHaveBeenCalledWith(
        mockExtensionProperties,
        mockBundle,
      );
      expect(proUtilities.writeProBundleToCache).toHaveBeenCalledWith(
        mockContext,
        'test-license-key',
        mockBundle,
        '3.3.0',
      );
      expect(showNotification).toHaveBeenCalledWith(
        'Turbo Console Log Pro Activated Successfully 🚀 🎉',
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
        'invalid-key',
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
        'invalid-key',
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

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('test-key');
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
        'test-license-key',
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
        'test-license-key',
        undefined,
      );
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
