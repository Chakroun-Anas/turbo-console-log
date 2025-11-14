import * as vscode from 'vscode';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  createTelemetryService,
  resetTelemetryService,
} from '@/telemetry/telemetryService';
import { TurboAnalyticsProvider } from '@/telemetry/TurboAnalyticsProvider';

// Mock dependencies
jest.mock('axios');
jest.mock('crypto');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();

// Mock vscode env to make it mutable
const mockVscodeEnv = {
  isTelemetryEnabled: true,
  machineId: 'test-machine-id',
  language: 'en',
  version: '1.85.0',
};

// Override the vscode env export
Object.defineProperty(vscode, 'env', {
  value: mockVscodeEnv,
  configurable: true,
  writable: true,
});

// Override vscode.version
Object.defineProperty(vscode, 'version', {
  value: '1.85.0',
  configurable: true,
  writable: true,
});

describe('TelemetryService', () => {
  let telemetryService: TurboAnalyticsProvider;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance for each test
    resetTelemetryService();

    // Mock console methods
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;

    // Reset env mock values
    mockVscodeEnv.isTelemetryEnabled = true;
    mockVscodeEnv.machineId = 'test-machine-id';
    mockVscodeEnv.language = 'en';
    mockVscodeEnv.version = '1.85.0';

    // Setup workspace mock
    const mockWorkspace = vscode.workspace as jest.Mocked<
      typeof vscode.workspace
    >;
    mockWorkspace.getConfiguration.mockReturnValue({
      get: jest.fn().mockReturnValue(true), // Default: telemetry enabled
    } as unknown as vscode.WorkspaceConfiguration);

    // Setup extensions mock
    const mockExtensions = vscode.extensions as jest.Mocked<
      typeof vscode.extensions
    >;
    mockExtensions.getExtension.mockReturnValue({
      packageJSON: { version: '3.5.0' },
    } as vscode.Extension<unknown>);

    // Setup mock extension context
    const mockGlobalState = {
      get: jest.fn(),
      update: jest.fn(),
      keys: jest.fn(),
      setKeysForSync: jest.fn(),
    };

    mockContext = {
      globalState: mockGlobalState,
    } as unknown as vscode.ExtensionContext;

    // Setup crypto mock
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('abcd1234567890ef'),
    };
    mockedCrypto.createHash.mockReturnValue(mockHash as unknown as crypto.Hash);

    // Setup process mocks
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });

    // Create service instance
    telemetryService = createTelemetryService();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  describe('constructor', () => {
    it('should initialize with telemetry enabled when both VS Code and custom telemetry are enabled', () => {
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;

      mockVscodeEnv.isTelemetryEnabled = true;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true),
      } as unknown as vscode.WorkspaceConfiguration);

      const service = createTelemetryService();
      expect(service).toBeDefined();
      expect(mockWorkspace.getConfiguration).toHaveBeenCalledWith(
        'turboConsoleLog',
      );
    });

    it('should handle missing isTelemetryEnabled property (fallback to true)', () => {
      delete (mockVscodeEnv as { isTelemetryEnabled?: boolean })
        .isTelemetryEnabled;

      const service = createTelemetryService();
      expect(service).toBeDefined();
    });

    it('should check custom telemetry setting from configuration', () => {
      // Reset singleton to ensure fresh instance
      resetTelemetryService();
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      const mockConfig = {
        get: jest.fn().mockReturnValue(false),
      };
      mockWorkspace.getConfiguration.mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration,
      );

      createTelemetryService();

      expect(mockWorkspace.getConfiguration).toHaveBeenCalledWith(
        'turboConsoleLog',
      );
      expect(mockConfig.get).toHaveBeenCalledWith(
        'isTurboTelemetryEnabled',
        true,
      );
    });
  });

  describe('reportFreshInstall', () => {
    beforeEach(() => {
      // Mock successful axios response
      mockedAxios.post.mockResolvedValue({ status: 200 });
    });

    it('should send fresh install analytics when telemetry is enabled', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      await telemetryService.reportFreshInstall();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreshInstall',
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_/),
          installedAt: mockDate,
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: 'darwin',
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Sending fresh install analytics data:',
        expect.any(Object),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Fresh install report sent successfully',
      );
    });

    it('should not send analytics when VS Code telemetry is disabled', async () => {
      // Reset singleton to ensure new instance with disabled telemetry
      resetTelemetryService();
      mockVscodeEnv.isTelemetryEnabled = false;

      const disabledService = createTelemetryService();
      await disabledService.reportFreshInstall();

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping fresh install reporting',
      );
    });

    it('should not send analytics when custom telemetry is disabled', async () => {
      // Reset singleton to ensure new instance with disabled telemetry
      resetTelemetryService();
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      } as unknown as vscode.WorkspaceConfiguration);

      // Create new service with disabled custom telemetry
      const service = createTelemetryService();
      await service.reportFreshInstall();

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping fresh install reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      await telemetryService.reportFreshInstall();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send fresh install analytics:',
        error,
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      await telemetryService.reportFreshInstall();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreshInstall',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.any(Object),
      );
    });
  });

  describe('reportUpdate', () => {
    beforeEach(() => {
      // Mock successful axios response
      mockedAxios.post.mockResolvedValue({ status: 200 });
    });

    it('should send update analytics when telemetry is enabled and extension is in free mode', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockReturnValue(undefined); // No pro license

      await telemetryService.reportUpdate(mockContext);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportUpdate',
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_/),
          updatedAt: mockDate,
          newVersion: '3.5.0',
          isPro: false,
          timezoneOffset: mockDate.getTimezoneOffset(),
          vscodeVersion: '1.85.0',
          platform: 'darwin',
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Sending update analytics data:',
        expect.any(Object),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Update analytics sent successfully',
      );
    });

    it('should detect pro mode correctly', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return 'valid-license-key';
        if (key === 'pro-bundle') return 'valid-pro-bundle';
        return undefined;
      });

      await telemetryService.reportUpdate(mockContext);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportUpdate',
        expect.objectContaining({
          isPro: true,
        }),
        expect.any(Object),
      );
    });

    it('should not detect pro mode when license key is missing', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return undefined;
        if (key === 'pro-bundle') return 'valid-pro-bundle';
        return undefined;
      });

      await telemetryService.reportUpdate(mockContext);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportUpdate',
        expect.objectContaining({
          isPro: false,
        }),
        expect.any(Object),
      );
    });

    it('should not detect pro mode when pro bundle is missing', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return 'valid-license-key';
        if (key === 'pro-bundle') return undefined;
        return undefined;
      });

      await telemetryService.reportUpdate(mockContext);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportUpdate',
        expect.objectContaining({
          isPro: false,
        }),
        expect.any(Object),
      );
    });

    it('should handle globalState errors gracefully', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation(() => {
        throw new Error('GlobalState error');
      });

      await telemetryService.reportUpdate(mockContext);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportUpdate',
        expect.objectContaining({
          isPro: false,
        }),
        expect.any(Object),
      );
    });

    it('should not send analytics when telemetry is disabled', async () => {
      // Reset singleton to ensure new instance with disabled telemetry
      resetTelemetryService();
      mockVscodeEnv.isTelemetryEnabled = false;

      const disabledService = createTelemetryService();
      await disabledService.reportUpdate(mockContext);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping update reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      await telemetryService.reportUpdate(mockContext);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send update analytics:',
        error,
      );
    });
  });

  describe('reportCommandsInserted', () => {
    beforeEach(() => {
      // Mock successful axios response
      mockedAxios.post.mockResolvedValue({ status: 200 });
    });

    it('should send commands inserted analytics when telemetry is enabled and extension is in free mode', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockReturnValue(undefined); // No pro license

      await telemetryService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_/),
          count: 10,
          isPro: false,
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: 'darwin',
          updatedAt: mockDate,
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Sending commands inserted analytics data:',
        expect.any(Object),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Commands inserted analytics sent successfully',
      );
    });

    it('should detect pro mode correctly', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return 'valid-license-key';
        if (key === 'pro-bundle') return 'valid-pro-bundle';
        return undefined;
      });

      await telemetryService.reportCommandsInserted(mockContext, 5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          isPro: true,
          count: 5,
        }),
        expect.any(Object),
      );
    });

    it('should not detect pro mode when license key is missing', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return undefined;
        if (key === 'pro-bundle') return 'valid-pro-bundle';
        return undefined;
      });

      await telemetryService.reportCommandsInserted(mockContext, 3);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          isPro: false,
          count: 3,
        }),
        expect.any(Object),
      );
    });

    it('should not detect pro mode when pro bundle is missing', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation((key: string) => {
        if (key === 'license-key') return 'valid-license-key';
        if (key === 'pro-bundle') return undefined;
        return undefined;
      });

      await telemetryService.reportCommandsInserted(mockContext, 7);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          isPro: false,
          count: 7,
        }),
        expect.any(Object),
      );
    });

    it('should handle different count values correctly', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockReturnValue(undefined);

      // Test with count = 1
      await telemetryService.reportCommandsInserted(mockContext, 1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          count: 1,
        }),
        expect.any(Object),
      );

      // Test with count = 15
      await telemetryService.reportCommandsInserted(mockContext, 15);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          count: 15,
        }),
        expect.any(Object),
      );
    });

    it('should handle globalState errors gracefully', async () => {
      const mockGlobalState =
        mockContext.globalState as unknown as jest.Mocked<vscode.Memento>;
      mockGlobalState.get.mockImplementation(() => {
        throw new Error('GlobalState error');
      });

      await telemetryService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          isPro: false,
          count: 10,
        }),
        expect.any(Object),
      );
    });

    it('should not send analytics when telemetry is disabled', async () => {
      // Reset singleton to ensure new instance with disabled telemetry
      resetTelemetryService();
      mockVscodeEnv.isTelemetryEnabled = false;

      const disabledService = createTelemetryService();
      await disabledService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping commands inserted reporting',
      );
    });

    it('should not send analytics when custom telemetry is disabled', async () => {
      // Reset singleton to ensure new instance with disabled custom telemetry
      resetTelemetryService();
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false), // Custom telemetry disabled
      } as unknown as vscode.WorkspaceConfiguration);

      const disabledService = createTelemetryService();
      await disabledService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping commands inserted reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      await telemetryService.reportCommandsInserted(mockContext, 10);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send commands inserted analytics:',
        error,
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      await telemetryService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/undefined',
          },
        }),
      );
    });

    it('should handle missing extension packageJSON gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue({
        packageJSON: { version: undefined },
      } as vscode.Extension<unknown>);

      await telemetryService.reportCommandsInserted(mockContext, 10);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportInsertionsCommandsCount',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.any(Object),
      );
    });
  });

  describe('reportFreemiumPanelOpening', () => {
    beforeEach(() => {
      // Reset singleton and mocks for each test
      resetTelemetryService();
      jest.clearAllMocks();

      // Setup axios mock as resolved by default
      mockedAxios.post.mockResolvedValue({ status: 200 });

      // Reset env mock values to enabled state
      mockVscodeEnv.isTelemetryEnabled = true;

      // Reset workspace mock to enabled state
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true), // Telemetry enabled
      } as unknown as vscode.WorkspaceConfiguration);

      // Reset extension mock
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue({
        packageJSON: { version: '3.5.0' },
      } as vscode.Extension<unknown>);
    });

    it('should send analytics data when telemetry is enabled', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportFreemiumPanelOpening();

      // Verify the axios call was made
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelOpening',
        expect.objectContaining({
          developerId: 'dev_abcd1234567890ef',
          openedAt: mockDate,
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: expect.any(String),
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Freemium panel opening report sent successfully',
      );
    });

    it('should skip analytics when telemetry is disabled globally', async () => {
      // Disable VS Code telemetry
      mockVscodeEnv.isTelemetryEnabled = false;
      const disabledService = createTelemetryService();

      await disabledService.reportFreemiumPanelOpening();

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping freemium panel opening reporting',
      );
    });

    it('should skip analytics when custom telemetry is disabled', async () => {
      // Mock workspace configuration to disable custom telemetry
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false), // Custom telemetry disabled
      } as unknown as vscode.WorkspaceConfiguration);

      const disabledService = createTelemetryService();
      await disabledService.reportFreemiumPanelOpening();

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping freemium panel opening reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const service = createTelemetryService();
      await service.reportFreemiumPanelOpening();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send freemium panel opening analytics:',
        error,
      );
    });

    it('should generate consistent analytics payload structure', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportFreemiumPanelOpening();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      const callArgs = mockedAxios.post.mock.calls[0];
      const payload = callArgs[1] as unknown as {
        developerId: string;
        openedAt: Date;
        timezoneOffset: number;
        extensionVersion: string;
        vscodeVersion: string;
        platform: string;
      };

      // Verify structure
      expect(payload.developerId).toBe('dev_abcd1234567890ef');
      expect(payload.openedAt).toBe(mockDate);
      expect(payload.timezoneOffset).toBe(mockDate.getTimezoneOffset());
      expect(payload.extensionVersion).toBe('3.5.0');
      expect(payload.vscodeVersion).toBe('1.85.0');
      expect(typeof payload.platform).toBe('string');
    });

    it('should use correct API endpoint and headers', async () => {
      const service = createTelemetryService();
      await service.reportFreemiumPanelOpening();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelOpening',
        expect.any(Object),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      const service = createTelemetryService();
      await service.reportFreemiumPanelOpening();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelOpening',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/undefined',
          },
        }),
      );
    });
  });

  describe('generateDeveloperId', () => {
    it('should generate consistent developer ID with crypto available', async () => {
      // Test indirectly through reportFreshInstall
      await telemetryService.reportFreshInstall();

      expect(mockedCrypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          developerId: 'dev_abcd1234567890ef',
        }),
        expect.any(Object),
      );
    });

    it('should fallback to simple hash when crypto is not available', async () => {
      // Mock crypto as unavailable
      mockedCrypto.createHash.mockImplementation(() => {
        throw new Error('Crypto not available');
      });

      await telemetryService.reportFreshInstall();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_/),
        }),
        expect.any(Object),
      );
    });

    it('should use machine ID fallback when crypto fails', async () => {
      // Mock crypto as unavailable
      mockedCrypto.createHash.mockImplementation(() => {
        throw new Error('Crypto not available');
      });

      mockVscodeEnv.machineId = 'specific-machine-id';

      await telemetryService.reportFreshInstall();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_machine_specific-machi/),
        }),
        expect.any(Object),
      );
    });

    it('should use timestamp fallback when machine ID is not available', async () => {
      // Mock crypto as unavailable
      mockedCrypto.createHash.mockImplementation(() => {
        throw new Error('Crypto not available');
      });

      mockVscodeEnv.machineId = 'unknown-machine';

      // Mock Date.now and Math.random for predictable fallback
      const originalDateNow = Date.now;
      const originalMathRandom = Math.random;
      Date.now = jest.fn().mockReturnValue(1692360000000);
      Math.random = jest.fn().mockReturnValue(0.123456);

      await telemetryService.reportFreshInstall();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_fallback_/),
        }),
        expect.any(Object),
      );

      // Restore original functions
      Date.now = originalDateNow;
      Math.random = originalMathRandom;
    });
  });

  describe('reportFreemiumPanelCtaClick', () => {
    beforeEach(() => {
      // Reset singleton and mocks for each test
      resetTelemetryService();
      jest.clearAllMocks();

      // Setup axios mock as resolved by default
      mockedAxios.post.mockResolvedValue({ status: 200 });

      // Reset env mock values to enabled state
      mockVscodeEnv.isTelemetryEnabled = true;

      // Reset workspace mock to enabled state
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true), // Telemetry enabled
      } as unknown as vscode.WorkspaceConfiguration);

      // Reset extension mock
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue({
        packageJSON: { version: '3.5.0' },
      } as vscode.Extension<unknown>);
    });

    it('should send CTA click analytics data when telemetry is enabled', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportFreemiumPanelCtaClick(
        'survey',
        '📝 Take Survey',
        'https://www.turboconsolelog.io/community-survey',
      );

      // Verify the axios call was made
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          developerId: 'dev_abcd1234567890ef',
          clickedAt: mockDate,
          ctaType: 'survey',
          ctaText: '📝 Take Survey',
          ctaUrl: 'https://www.turboconsolelog.io/community-survey',
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: expect.any(String),
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Freemium panel CTA click report sent successfully',
      );
    });

    it('should handle different CTA types correctly', async () => {
      const service = createTelemetryService();

      // Test countdown CTA
      await service.reportFreemiumPanelCtaClick(
        'countdown',
        '🔥 Unlock Turbo PRO Now!',
        'https://www.turboconsolelog.io/pro',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          ctaType: 'countdown',
          ctaText: '🔥 Unlock Turbo PRO Now!',
          ctaUrl: 'https://www.turboconsolelog.io/pro',
        }),
        expect.any(Object),
      );

      jest.clearAllMocks();

      // Test article CTA
      await service.reportFreemiumPanelCtaClick(
        'article',
        'Debugging: Between Science & Art',
        'https://www.turboconsolelog.io/articles/debugging-science-art',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          ctaType: 'article',
          ctaText: 'Debugging: Between Science & Art',
          ctaUrl:
            'https://www.turboconsolelog.io/articles/debugging-science-art',
        }),
        expect.any(Object),
      );
    });

    it('should skip analytics when telemetry is disabled globally', async () => {
      // Disable VS Code telemetry
      mockVscodeEnv.isTelemetryEnabled = false;
      const disabledService = createTelemetryService();

      await disabledService.reportFreemiumPanelCtaClick(
        'survey',
        'Test Button',
        'https://example.com',
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping freemium panel CTA click reporting',
      );
    });

    it('should skip analytics when custom telemetry is disabled', async () => {
      // Mock workspace configuration to disable custom telemetry
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false), // Custom telemetry disabled
      } as unknown as vscode.WorkspaceConfiguration);

      const disabledService = createTelemetryService();
      await disabledService.reportFreemiumPanelCtaClick(
        'survey',
        'Test Button',
        'https://example.com',
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping freemium panel CTA click reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const service = createTelemetryService();
      await service.reportFreemiumPanelCtaClick(
        'survey',
        'Test Button',
        'https://example.com',
      );

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send freemium panel CTA click analytics:',
        error,
      );
    });

    it('should generate consistent analytics payload structure', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportFreemiumPanelCtaClick(
        'countdown',
        'Get Pro Now',
        'https://www.turboconsolelog.io/pro',
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      const callArgs = mockedAxios.post.mock.calls[0];
      const payload = callArgs[1] as unknown as {
        developerId: string;
        clickedAt: Date;
        ctaType: string;
        ctaText: string;
        ctaUrl: string;
        timezoneOffset: number;
        extensionVersion: string;
        vscodeVersion: string;
        platform: string;
      };

      // Verify structure
      expect(payload.developerId).toBe('dev_abcd1234567890ef');
      expect(payload.clickedAt).toBe(mockDate);
      expect(payload.ctaType).toBe('countdown');
      expect(payload.ctaText).toBe('Get Pro Now');
      expect(payload.ctaUrl).toBe('https://www.turboconsolelog.io/pro');
      expect(payload.timezoneOffset).toBe(mockDate.getTimezoneOffset());
      expect(payload.extensionVersion).toBe('3.5.0');
      expect(payload.vscodeVersion).toBe('1.85.0');
      expect(typeof payload.platform).toBe('string');
    });

    it('should use correct API endpoint and headers', async () => {
      const service = createTelemetryService();
      await service.reportFreemiumPanelCtaClick(
        'survey',
        'Test',
        'https://example.com',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.any(Object),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      const service = createTelemetryService();
      await service.reportFreemiumPanelCtaClick(
        'survey',
        'Test',
        'https://example.com',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/undefined',
          },
        }),
      );
    });

    it('should handle empty or special character CTA text', async () => {
      const service = createTelemetryService();

      // Test with empty string
      await service.reportFreemiumPanelCtaClick(
        'survey',
        '',
        'https://example.com',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          ctaText: '',
        }),
        expect.any(Object),
      );

      jest.clearAllMocks();

      // Test with special characters
      await service.reportFreemiumPanelCtaClick(
        'survey',
        '🎯 Join & Get Your Pro Discount 🚀',
        'https://example.com',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportFreemiumPanelCtaClick',
        expect.objectContaining({
          ctaText: '🎯 Join & Get Your Pro Discount 🚀',
        }),
        expect.any(Object),
      );
    });
  });

  describe('reportNotificationInteraction', () => {
    beforeEach(() => {
      // Reset singleton and mocks for each test
      resetTelemetryService();
      jest.clearAllMocks();

      // Setup axios mock as resolved by default
      mockedAxios.post.mockResolvedValue({ status: 200 });

      // Reset env mock values to enabled state
      mockVscodeEnv.isTelemetryEnabled = true;

      // Reset workspace mock to enabled state
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true),
      } as unknown as vscode.WorkspaceConfiguration);

      // Reset extension mock
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue({
        packageJSON: { version: '3.5.0' },
      } as vscode.Extension<unknown>);
    });

    it('should send notification interaction analytics when telemetry is enabled', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'onboarding-tips',
        'shown',
        'variant-a',
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportNotificationInteraction',
        expect.objectContaining({
          developerId: 'dev_abcd1234567890ef',
          notificationEvent: 'onboarding-tips',
          interactionType: 'shown',
          variant: 'variant-a',
          reactionTimeMs: undefined,
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: expect.any(String),
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (shown) report sent successfully for variant variant-a',
      );
    });

    it('should send click interaction with reaction time', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'pro-features',
        'clicked',
        'variant-b',
        2500,
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportNotificationInteraction',
        expect.objectContaining({
          notificationEvent: 'pro-features',
          interactionType: 'clicked',
          variant: 'variant-b',
          reactionTimeMs: 2500,
        }),
        expect.any(Object),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (clicked) report sent successfully for variant variant-b',
      );
    });

    it('should send dismiss interaction', async () => {
      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'feature-announcement',
        'dismissed',
        'variant-c',
        1200,
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportNotificationInteraction',
        expect.objectContaining({
          notificationEvent: 'feature-announcement',
          interactionType: 'dismissed',
          variant: 'variant-c',
          reactionTimeMs: 1200,
        }),
        expect.any(Object),
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (dismissed) report sent successfully for variant variant-c',
      );
    });

    it('should handle all interaction types correctly', async () => {
      const service = createTelemetryService();

      // Test shown
      await service.reportNotificationInteraction(
        'event-1',
        'shown',
        'variant-x',
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ interactionType: 'shown' }),
        expect.any(Object),
      );

      // Test clicked
      await service.reportNotificationInteraction(
        'event-2',
        'clicked',
        'variant-y',
        1500,
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ interactionType: 'clicked' }),
        expect.any(Object),
      );

      // Test dismissed
      await service.reportNotificationInteraction(
        'event-3',
        'dismissed',
        'variant-z',
        800,
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ interactionType: 'dismissed' }),
        expect.any(Object),
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it('should skip analytics when telemetry is disabled globally', async () => {
      mockVscodeEnv.isTelemetryEnabled = false;
      const disabledService = createTelemetryService();

      await disabledService.reportNotificationInteraction(
        'event',
        'shown',
        'variant',
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping notification interaction reporting',
      );
    });

    it('should skip analytics when custom telemetry is disabled', async () => {
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      } as unknown as vscode.WorkspaceConfiguration);

      const disabledService = createTelemetryService();
      await disabledService.reportNotificationInteraction(
        'event',
        'clicked',
        'variant',
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping notification interaction reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'test-event',
        'shown',
        'test-variant',
      );

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send notification interaction analytics:',
        error,
      );
    });

    it('should generate consistent analytics payload structure', async () => {
      const mockDate = new Date('2025-08-18T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'my-event',
        'clicked',
        'my-variant',
        3000,
      );

      const callArgs = mockedAxios.post.mock.calls[0];
      const payload = callArgs[1] as {
        developerId: string;
        notificationEvent: string;
        interactionType: string;
        variant: string;
        reactionTimeMs: number;
        timezoneOffset: number;
        extensionVersion: string;
        vscodeVersion: string;
        platform: string;
      };

      expect(payload.developerId).toBe('dev_abcd1234567890ef');
      expect(payload.notificationEvent).toBe('my-event');
      expect(payload.interactionType).toBe('clicked');
      expect(payload.variant).toBe('my-variant');
      expect(payload.reactionTimeMs).toBe(3000);
      expect(payload.timezoneOffset).toBe(mockDate.getTimezoneOffset());
      expect(payload.extensionVersion).toBe('3.5.0');
      expect(payload.vscodeVersion).toBe('1.85.0');
      expect(typeof payload.platform).toBe('string');
    });

    it('should use correct API endpoint and headers', async () => {
      const service = createTelemetryService();
      await service.reportNotificationInteraction('event', 'shown', 'variant');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportNotificationInteraction',
        expect.any(Object),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      const service = createTelemetryService();
      await service.reportNotificationInteraction(
        'event',
        'dismissed',
        'variant',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportNotificationInteraction',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/undefined',
          },
        }),
      );
    });

    it('should handle different event and variant names', async () => {
      const service = createTelemetryService();

      const testCases = [
        { event: 'welcome-message', variant: 'v1' },
        { event: 'feature-update', variant: 'control' },
        { event: 'pro-promotion', variant: 'aggressive' },
        { event: 'survey-request', variant: 'friendly' },
      ];

      for (const testCase of testCases) {
        await service.reportNotificationInteraction(
          testCase.event,
          'shown',
          testCase.variant,
        );
      }

      expect(mockedAxios.post).toHaveBeenCalledTimes(testCases.length);

      testCases.forEach((testCase, index) => {
        const callArgs = mockedAxios.post.mock.calls[index];
        const payload = callArgs[1] as {
          notificationEvent: string;
          variant: string;
        };
        expect(payload.notificationEvent).toBe(testCase.event);
        expect(payload.variant).toBe(testCase.variant);
      });
    });

    it('should handle reaction time edge cases', async () => {
      const service = createTelemetryService();

      // Zero reaction time
      await service.reportNotificationInteraction(
        'instant-click',
        'clicked',
        'variant',
        0,
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ reactionTimeMs: 0 }),
        expect.any(Object),
      );

      // Very large reaction time
      await service.reportNotificationInteraction(
        'slow-click',
        'clicked',
        'variant',
        60000,
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ reactionTimeMs: 60000 }),
        expect.any(Object),
      );

      // Undefined reaction time (for shown events)
      await service.reportNotificationInteraction(
        'shown-only',
        'shown',
        'variant',
      );
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ reactionTimeMs: undefined }),
        expect.any(Object),
      );
    });

    it('should log correct console messages for each interaction type', async () => {
      const service = createTelemetryService();

      await service.reportNotificationInteraction(
        'event-1',
        'shown',
        'variant-a',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (shown) report sent successfully for variant variant-a',
      );

      await service.reportNotificationInteraction(
        'event-2',
        'clicked',
        'variant-b',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (clicked) report sent successfully for variant variant-b',
      );

      await service.reportNotificationInteraction(
        'event-3',
        'dismissed',
        'variant-c',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Notification interaction (dismissed) report sent successfully for variant variant-c',
      );
    });
  });

  describe('reportWebviewInteraction', () => {
    beforeEach(() => {
      // Mock successful axios response
      mockedAxios.post.mockResolvedValue({ status: 200 });
    });

    it('should send webview interaction analytics when telemetry is enabled', async () => {
      const mockDate = new Date('2025-11-16T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'A', 'shown');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportWebviewInteraction',
        expect.objectContaining({
          developerId: expect.stringMatching(/^dev_/),
          version: '3.10.0',
          variant: 'A',
          interactionType: 'shown',
          timezoneOffset: mockDate.getTimezoneOffset(),
          extensionVersion: '3.5.0',
          vscodeVersion: '1.85.0',
          platform: 'darwin',
        }),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );
    });

    it('should send webview click interaction with correct type', async () => {
      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'B', 'clicked');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportWebviewInteraction',
        expect.objectContaining({
          version: '3.10.0',
          variant: 'B',
          interactionType: 'clicked',
        }),
        expect.any(Object),
      );
    });

    it('should handle different webview versions', async () => {
      const service = createTelemetryService();

      await service.reportWebviewInteraction('3.10.0', 'A', 'shown');
      await service.reportWebviewInteraction('3.11.0', 'B', 'clicked');
      await service.reportWebviewInteraction('3.9.0', 'C', 'shown');

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        expect.objectContaining({ version: '3.10.0', variant: 'A' }),
        expect.any(Object),
      );
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({ version: '3.11.0', variant: 'B' }),
        expect.any(Object),
      );
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        3,
        expect.any(String),
        expect.objectContaining({ version: '3.9.0', variant: 'C' }),
        expect.any(Object),
      );
    });

    it('should not send analytics when VS Code telemetry is disabled', async () => {
      resetTelemetryService();
      mockVscodeEnv.isTelemetryEnabled = false;

      const disabledService = createTelemetryService();
      await disabledService.reportWebviewInteraction('3.10.0', 'A', 'shown');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping webview interaction reporting',
      );
    });

    it('should not send analytics when custom telemetry is disabled', async () => {
      resetTelemetryService();
      const mockWorkspace = vscode.workspace as jest.Mocked<
        typeof vscode.workspace
      >;
      mockWorkspace.getConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      } as unknown as vscode.WorkspaceConfiguration);

      const disabledService = createTelemetryService();
      await disabledService.reportWebviewInteraction('3.10.0', 'B', 'clicked');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Telemetry is disabled, skipping webview interaction reporting',
      );
    });

    it('should handle axios errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'A', 'shown');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to send webview interaction analytics:',
        error,
      );
    });

    it('should generate consistent analytics payload structure', async () => {
      const mockDate = new Date('2025-11-16T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'C', 'clicked');

      const callArgs = mockedAxios.post.mock.calls[0];
      const payload = callArgs[1] as {
        developerId: string;
        version: string;
        variant: string;
        interactionType: string;
        timezoneOffset: number;
        extensionVersion: string;
        vscodeVersion: string;
        platform: string;
      };

      expect(payload.developerId).toBe('dev_abcd1234567890ef');
      expect(payload.version).toBe('3.10.0');
      expect(payload.variant).toBe('C');
      expect(payload.interactionType).toBe('clicked');
      expect(payload.timezoneOffset).toBe(mockDate.getTimezoneOffset());
      expect(payload.extensionVersion).toBe('3.5.0');
      expect(payload.vscodeVersion).toBe('1.85.0');
      expect(typeof payload.platform).toBe('string');
    });

    it('should use correct API endpoint and headers', async () => {
      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'A', 'shown');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportWebviewInteraction',
        expect.any(Object),
        expect.objectContaining({
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/3.5.0',
          },
        }),
      );
    });

    it('should handle missing extension version gracefully', async () => {
      const mockExtensions = vscode.extensions as jest.Mocked<
        typeof vscode.extensions
      >;
      mockExtensions.getExtension.mockReturnValue(undefined);

      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'B', 'shown');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/reportWebviewInteraction',
        expect.objectContaining({
          extensionVersion: undefined,
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'turbo-console-log-extension/undefined',
          },
        }),
      );
    });

    it('should handle all variant options (A, B, C, fallback)', async () => {
      const service = createTelemetryService();

      const testCases = [
        { version: '3.10.0', variant: 'A', type: 'shown' as const },
        { version: '3.10.0', variant: 'B', type: 'clicked' as const },
        { version: '3.10.0', variant: 'C', type: 'shown' as const },
        { version: '3.10.0', variant: 'fallback', type: 'clicked' as const },
      ];

      for (const testCase of testCases) {
        await service.reportWebviewInteraction(
          testCase.version,
          testCase.variant,
          testCase.type,
        );
      }

      expect(mockedAxios.post).toHaveBeenCalledTimes(testCases.length);

      testCases.forEach((testCase, index) => {
        const callArgs = mockedAxios.post.mock.calls[index];
        const payload = callArgs[1] as {
          version: string;
          variant: string;
          interactionType: string;
        };
        expect(payload.version).toBe(testCase.version);
        expect(payload.variant).toBe(testCase.variant);
        expect(payload.interactionType).toBe(testCase.type);
      });
    });

    it('should log correct console messages for each interaction type', async () => {
      const service = createTelemetryService();

      await service.reportWebviewInteraction('3.10.0', 'A', 'shown');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Webview interaction (shown) report sent successfully for variant A',
      );

      await service.reportWebviewInteraction('3.10.0', 'B', 'clicked');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Turbo Console Log] Webview interaction (clicked) report sent successfully for variant B',
      );
    });

    it('should include timezone offset from current date', async () => {
      const mockDate = new Date('2025-11-16T15:30:00.000Z');
      const expectedOffset = mockDate.getTimezoneOffset();
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const service = createTelemetryService();
      await service.reportWebviewInteraction('3.10.0', 'C', 'shown');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timezoneOffset: expectedOffset }),
        expect.any(Object),
      );
    });
  });

  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => telemetryService.dispose()).not.toThrow();
    });
  });

  describe('createTelemetryService factory', () => {
    it('should create a telemetry service instance', () => {
      const service = createTelemetryService();
      expect(service).toBeDefined();
      expect(typeof service.reportFreshInstall).toBe('function');
      expect(typeof service.reportUpdate).toBe('function');
      expect(typeof service.reportCommandsInserted).toBe('function');
      expect(typeof service.reportFreemiumPanelOpening).toBe('function');
      expect(typeof service.reportFreemiumPanelCtaClick).toBe('function');
      expect(typeof service.dispose).toBe('function');
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const service1 = createTelemetryService();
      const service2 = createTelemetryService();
      expect(service1).toBe(service2);
    });

    it('should create a new instance after reset', () => {
      const service1 = createTelemetryService();
      resetTelemetryService();
      const service2 = createTelemetryService();
      expect(service1).not.toBe(service2);
    });
  });
});
