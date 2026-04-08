import * as vscode from 'vscode';
import { activateTrialCommand } from '@/commands/activateTrial';
import {
  makeExtensionContext,
  makeDebugMessage,
} from '@/jest-tests/mocks/helpers';
import { ExtensionProperties } from '@/entities';
import * as proUtilities from '@/pro/utilities';
import { isOnline } from '@/pro/utilities/isOnline';
import { AxiosError } from 'axios';
import { TrialCountdownTimer } from '@/pro/TrialCountdownTimer';

// Mock the dependencies
jest.mock('@/pro/utilities');
jest.mock('@/pro/utilities/isOnline');
jest.mock('@/pro/TrialCountdownTimer');

describe('activateTrialCommand', () => {
  const mockContext = makeExtensionContext();
  const mockExtensionProperties = {} as ExtensionProperties;
  const mockDebugMessage = makeDebugMessage();
  const mockExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Default mocks
    (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
      'TRIAL-TESTKEY123456789012345678901',
    );
    (isOnline as jest.Mock).mockResolvedValue(true);
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: { version: '3.3.2' },
    });
    (proUtilities.fetchTrialBundle as jest.Mock).mockResolvedValue({
      bundle: 'mock-trial-bundle',
      expiresAt: mockExpiresAt,
    });
    (TrialCountdownTimer as jest.Mock).mockImplementation(() => ({
      start: jest.fn(),
      dispose: jest.fn(),
      isExpired: jest.fn().mockReturnValue(false),
    }));
  });

  describe('trial key input handling', () => {
    it('should reject trial key without TRIAL- prefix', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'invalid-key-without-prefix',
      );
      (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue('Cancel');

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '❌ Invalid trial key format. Trial keys start with "TRIAL-"',
        'Try Again',
        'Cancel',
      );
      expect(proUtilities.fetchTrialBundle).not.toHaveBeenCalled();
    });

    it('should reject trial key with wrong prefix and retry', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TCLP-WRONGPREFIX123456789012345678',
      );
      (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue(
        'Try Again',
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '❌ Invalid trial key format. Trial keys start with "TRIAL-"',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.activateTrial',
      );
    });

    it('should handle empty trial key input with cancellation', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('');
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Cancel',
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Trial activation cancelled — no trial key entered!',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should handle empty trial key input with retry', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('');
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Try Again',
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Trial activation cancelled — no trial key entered!',
        'Try Again',
        'Cancel',
      );
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'turboConsoleLog.activateTrial',
      );
    });

    it('should handle undefined trial key input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
        'Cancel',
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Trial activation cancelled — no trial key entered!',
        'Try Again',
        'Cancel',
      );
    });

    it('should trim whitespace from trial key', async () => {
      const trialKeyWithSpaces = '  TRIAL-TESTKEY123456789012345678901  ';
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        trialKeyWithSpaces,
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchTrialBundle).toHaveBeenCalledWith(
        'TRIAL-TESTKEY123456789012345678901',
        '3.3.2',
      );
    });
  });

  describe('internet connection handling', () => {
    it('should show error message when offline', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(
        'TRIAL-TESTKEY123456789012345678901',
      );
      (isOnline as jest.Mock).mockResolvedValue(false);

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        '📡 No internet connection. Please connect and try again.',
      );
      expect(proUtilities.fetchTrialBundle).not.toHaveBeenCalled();
    });
  });

  describe('successful activation', () => {
    it('should successfully activate trial', async () => {
      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(proUtilities.fetchTrialBundle).toHaveBeenCalledWith(
        'TRIAL-TESTKEY123456789012345678901',
        '3.3.2',
      );
      expect(proUtilities.runProBundle).toHaveBeenCalledWith(
        mockExtensionProperties,
        'mock-trial-bundle',
        mockContext,
      );
      expect(mockContext.globalState.update).toHaveBeenCalledWith(
        'trial-key',
        'TRIAL-TESTKEY123456789012345678901',
      );
      expect(mockContext.globalState.update).toHaveBeenCalledWith(
        'trial-expires-at',
        mockExpiresAt.toISOString(),
      );
      expect(TrialCountdownTimer).toHaveBeenCalledWith(
        mockExpiresAt,
        mockContext,
        '3.3.2',
        expect.any(Function),
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        '🎉 Turbo Console Log Pro Trial Activated! You have 2 hours to explore all features.',
      );
    });

    it('should NOT write bundle to cache', async () => {
      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      // Ensure writeProBundleToCache is never called for trials
      expect(proUtilities.writeProBundleToCache).not.toHaveBeenCalled();
    });

    it('should start countdown timer', async () => {
      const mockTimerInstance = {
        start: jest.fn(),
        dispose: jest.fn(),
        isExpired: jest.fn(),
      };
      (TrialCountdownTimer as jest.Mock).mockImplementation(
        () => mockTimerInstance,
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(mockTimerInstance.start).toHaveBeenCalled();
      expect(mockContext.subscriptions.push).toHaveBeenCalledWith(
        mockTimerInstance,
      );
    });
  });

  describe('error handling', () => {
    it('should handle AxiosError with response data', async () => {
      const errorMessage = 'Trial key not found';
      const axiosError = new AxiosError('Request failed');
      (axiosError as unknown as { response: unknown }).response = {
        data: {
          error: errorMessage,
        },
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: {},
      };

      (proUtilities.fetchTrialBundle as jest.Mock).mockRejectedValue(
        axiosError,
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(errorMessage);
      expect(console.error).toHaveBeenCalledWith(
        'Trial activation failed: ',
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

      (proUtilities.fetchTrialBundle as jest.Mock).mockRejectedValue(
        axiosError,
      );

      const command = activateTrialCommand();
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

      (proUtilities.fetchTrialBundle as jest.Mock).mockRejectedValue(
        genericError,
      );

      const command = activateTrialCommand();
      await command.handler({
        context: mockContext,
        extensionProperties: mockExtensionProperties,
        debugMessage: mockDebugMessage,
      });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Something went wrong, please contact the support at support@turboconsolelog.io',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Trial activation failed: ',
        genericError,
      );
    });
  });

  describe('command registration', () => {
    it('should return correct command name', () => {
      const command = activateTrialCommand();
      expect(command.name).toBe('turboConsoleLog.activateTrial');
    });

    it('should have a handler function', () => {
      const command = activateTrialCommand();
      expect(typeof command.handler).toBe('function');
    });
  });
});
