import { ExtensionContext } from 'vscode';
import { traceExtensionVersionHistory } from '@/helpers/traceExtensionVersionHistory';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { writeToGlobalState } from '@/helpers/writeToGlobalState';
import { createTelemetryService } from '@/telemetry';
import { showNotification, NotificationEvent } from '@/notifications';

jest.mock('@/helpers/readFromGlobalState');
jest.mock('@/helpers/writeToGlobalState');
jest.mock('@/telemetry');
jest.mock('@/notifications');
jest.mock('@/helpers/showReleaseNotification');

describe('traceExtensionVersionHistory', () => {
  let mockContext: ExtensionContext;
  const currentVersion = '3.9.0';

  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = {} as ExtensionContext;

    // Default telemetry service mock with all required methods
    mockCreateTelemetryService.mockReturnValue({
      reportFreshInstall: jest.fn(),
      reportUpdate: jest.fn(),
      reportCommandsInserted: jest.fn(),
      reportFreemiumPanelOpening: jest.fn(),
      reportFreemiumPanelCtaClick: jest.fn(),
      dispose: jest.fn(),
      reportNotificationInteraction: jest.fn(),
      reportWebviewInteraction: jest.fn(),
      reportNotificationLimitReached: jest.fn(),
      reportNotificationsPaused: jest.fn(),
    } as ReturnType<typeof createTelemetryService>);
  });

  describe('Fresh Install Scenarios', () => {
    it('should detect fresh install when version history is empty and IS_NEW_USER is not false', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return undefined;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        [currentVersion],
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        0,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
        false,
      );

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportFreshInstall).toHaveBeenCalled();
      expect(telemetryService.reportUpdate).not.toHaveBeenCalled();
    });

    it('should detect fresh install when version history is empty array', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return [];
        if (key === 'IS_NEW_USER') return true;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        [currentVersion],
      );
      expect(mockShowNotification).toHaveBeenCalled();

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportFreshInstall).toHaveBeenCalled();
    });
  });

  describe('Legacy User Migration Scenarios', () => {
    it('should detect legacy existing user when IS_NEW_USER is false', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return false;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        [currentVersion],
      );

      expect(mockShowNotification).not.toHaveBeenCalled();

      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        expect.anything(),
      );

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalledWith(mockContext);
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });

    it('should detect in-between user when IS_NEW_USER is true but milestone flag exists', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return true;
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return false;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        [currentVersion],
      );

      expect(mockShowNotification).not.toHaveBeenCalled();

      expect(mockWriteToGlobalState).not.toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        0,
      );

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalledWith(mockContext);
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });

    it('should detect in-between user even when milestone flag is true', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return true;
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return true;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalledWith(mockContext);
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });
  });

  describe('Existing User Update Scenarios', () => {
    it('should append new version when user upgrades', () => {
      const existingHistory = ['3.7.0', '3.8.0'];
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return existingHistory;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        ['3.7.0', '3.8.0', currentVersion],
      );

      expect(mockShowNotification).not.toHaveBeenCalled();

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalledWith(mockContext);
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });

    it('should not duplicate version if already present', () => {
      const existingHistory = ['3.7.0', '3.8.0', currentVersion];
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return existingHistory;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        existingHistory,
      );

      expect(mockShowNotification).not.toHaveBeenCalled();

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).not.toHaveBeenCalled();
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });

    it('should handle single version history upgrade', () => {
      const existingHistory = ['3.8.0'];
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return existingHistory;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        ['3.8.0', currentVersion],
      );

      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('Telemetry Error Handling', () => {
    it('should not throw when telemetry service creation fails', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return undefined;
        return undefined;
      });

      mockCreateTelemetryService.mockImplementation(() => {
        throw new Error('Telemetry service unavailable');
      });

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      expect(() => {
        traceExtensionVersionHistory(mockContext, currentVersion);
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Turbo Console Log] Failed to report telemetry in traceExtensionVersionHistory:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not throw when telemetry reporting fails', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return undefined;
        return undefined;
      });

      mockCreateTelemetryService.mockReturnValue({
        reportFreshInstall: jest.fn().mockImplementation(() => {
          throw new Error('Network error');
        }),
        reportUpdate: jest.fn(),
        reportCommandsInserted: jest.fn(),
        reportFreemiumPanelOpening: jest.fn(),
        reportFreemiumPanelCtaClick: jest.fn(),
        dispose: jest.fn(),
        reportNotificationInteraction: jest.fn(),
        reportWebviewInteraction: jest.fn(),
        reportNotificationLimitReached: jest.fn(),
        reportNotificationsPaused: jest.fn(),
      } as ReturnType<typeof createTelemetryService>);

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      expect(() => {
        traceExtensionVersionHistory(mockContext, currentVersion);
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null version history gracefully', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return null;
        if (key === 'IS_NEW_USER') return undefined;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        [currentVersion],
      );
      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('should handle empty string version gracefully', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return ['3.8.0'];
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, '');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        ['3.8.0', ''],
      );
    });

    it('should maintain version order chronologically', () => {
      const existingHistory = ['3.5.0', '3.6.0', '3.7.0', '3.8.0'];
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return existingHistory;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        ['3.5.0', '3.6.0', '3.7.0', '3.8.0', currentVersion],
      );
    });
  });

  describe('Global State Writes', () => {
    it('should write exactly 3 global state values for fresh install', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return undefined;
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return undefined;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledTimes(3);
    });

    it('should write only 1 global state value for existing user upgrade', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return ['3.8.0'];
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      // Only EXTENSION_VERSION_HISTORY should be written
      // (showReleaseNotification is mocked and won't write to global state)
      expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'EXTENSION_VERSION_HISTORY',
        ['3.8.0', currentVersion],
      );
    });

    it('should write only 1 global state value when version already exists', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return [currentVersion];
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with IS_NEW_USER flag', () => {
    it('should treat IS_NEW_USER=true with no milestone as fresh install', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return true;
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return undefined; // Key missing = fresh
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockShowNotification).toHaveBeenCalled();
      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportFreshInstall).toHaveBeenCalled();
    });

    it('should treat IS_NEW_USER=undefined with no milestone as fresh install', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return undefined;
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return undefined;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockShowNotification).toHaveBeenCalled();
      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportFreshInstall).toHaveBeenCalled();
    });

    it('should treat IS_NEW_USER=false as existing user (legacy)', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === 'EXTENSION_VERSION_HISTORY') return undefined;
        if (key === 'IS_NEW_USER') return false;
        return undefined;
      });

      traceExtensionVersionHistory(mockContext, currentVersion);

      expect(mockShowNotification).not.toHaveBeenCalled();
      const telemetryService = mockCreateTelemetryService();
      expect(telemetryService.reportUpdate).toHaveBeenCalled();
      expect(telemetryService.reportFreshInstall).not.toHaveBeenCalled();
    });
  });
});
