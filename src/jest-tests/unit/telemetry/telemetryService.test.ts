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
        mockContext.globalState as jest.Mocked<vscode.Memento>;
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
        mockContext.globalState as jest.Mocked<vscode.Memento>;
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
        mockContext.globalState as jest.Mocked<vscode.Memento>;
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
        mockContext.globalState as jest.Mocked<vscode.Memento>;
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
        mockContext.globalState as jest.Mocked<vscode.Memento>;
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
