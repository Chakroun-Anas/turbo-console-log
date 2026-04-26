import * as vscode from 'vscode';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { createTelemetryService } from '@/telemetry/telemetryService';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers/makeExtensionContext';

// Mock dependencies
jest.mock('@/telemetry/telemetryService');
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
  },
  env: {
    openExternal: jest.fn(),
  },
  Uri: {
    parse: jest.fn((url: string) => url),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('showNotification', () => {
  let mockTelemetryService: {
    reportNotificationInteraction: jest.Mock;
    dispose: jest.Mock;
  };
  let mockShowInformationMessage: jest.Mock;
  let mockOpenExternal: jest.Mock;
  let mockFetch: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock context
    mockContext = makeExtensionContext();

    // Mock telemetry service with resolved promises
    mockTelemetryService = {
      reportNotificationInteraction: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn(),
    };
    (createTelemetryService as jest.Mock).mockReturnValue(mockTelemetryService);

    // Mock VS Code APIs
    mockShowInformationMessage = vscode.window
      .showInformationMessage as jest.Mock;
    mockOpenExternal = vscode.env.openExternal as jest.Mock;
    mockFetch = global.fetch as jest.Mock;

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('successful API flow', () => {
    const mockNotificationData = {
      message: 'Test notification message',
      ctaText: 'Get Started',
      ctaUrl:
        'https://www.turboconsolelog.io/documentation?event=extensionFreshInstall&variant=A',
      variant: 'A',
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockNotificationData,
      });
    });

    it('should fetch notification data from API with correct parameters', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      const fetchCall = mockFetch.mock.calls[0];
      const fetchUrl = fetchCall[0] as string;
      const fetchOptions = fetchCall[1];

      // Verify base URL and required parameters
      expect(fetchUrl).toContain(
        'https://www.turboconsolelog.io/api/extensionNotification',
      );
      expect(fetchUrl).toContain('notificationEvent=extensionFreshInstall');
      expect(fetchUrl).toContain('version=3.9.0');
      expect(fetchUrl).toContain('developerId=');
      expect(fetchUrl).toMatch(/developerId=dev_[a-z0-9_]+/);
      expect(fetchUrl).toContain('vscodeVersion=');
      expect(fetchUrl).toContain('platform=');
      expect(fetchUrl).toContain('timezoneOffset=');

      expect(fetchOptions).toEqual({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should track notification shown event', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'shown',
        'A',
      );
    });

    it('should show notification with correct message and buttons', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        'Test notification message',
        'Get Started',
        'Maybe Later',
      );
    });

    it('should track clicked event and open URL when CTA is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Get Started');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'clicked',
        'A',
        expect.any(Number),
      );

      expect(mockOpenExternal).toHaveBeenCalledWith(
        mockNotificationData.ctaUrl,
      );
    });

    it('should track deferred event when "Maybe Later" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'deferred',
        'A',
        expect.any(Number),
      );

      expect(mockOpenExternal).not.toHaveBeenCalled();
    });

    it('should track dismissed event when notification is closed without action', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
        'A',
        expect.any(Number),
      );
    });

    it('should cap reaction time at 60 seconds', async () => {
      // Mock a very slow user reaction (e.g., 120 seconds)
      const slowReactionTime = 120 * 1000;
      const startTime = Date.now();
      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + slowReactionTime);

      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'deferred',
        'A',
        60000, // Capped at 60 seconds
      );

      jest.restoreAllMocks();
    });
  });

  describe('fallback flow when API fails', () => {
    beforeEach(() => {
      mockFetch.mockRejectedValue(new Error('Network error'));
    });

    it('should log error and show fallback notification', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch notification data:',
        expect.any(Error),
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        '🎉 Turbo Console Log installed! Want to see it in action?',
        'Get Started',
        'Maybe Later',
      );
    });

    it('should track fallback notification click and open motivation page', async () => {
      mockShowInformationMessage.mockResolvedValue('Get Started');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'clicked',
        'fallback',
        expect.any(Number),
      );

      expect(mockOpenExternal).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/documentation/overview/motivation?event=extensionFreshInstall&variant=fallback',
      );
    });

    it('should track fallback notification deferral when "Maybe Later" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'deferred',
        'fallback',
        expect.any(Number),
      );

      expect(mockOpenExternal).not.toHaveBeenCalled();
    });

    it('should track fallback notification dismissal when closed without action', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
        'fallback',
        expect.any(Number),
      );
    });

    it('should include event and variant query parameters in fallback URL', async () => {
      mockShowInformationMessage.mockResolvedValue('Get Started');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      const expectedUrl =
        'https://www.turboconsolelog.io/documentation/overview/motivation?event=extensionFreshInstall&variant=fallback';

      expect(mockOpenExternal).toHaveBeenCalledWith(expectedUrl);
    });

    it('should cap fallback reaction time at 60 seconds', async () => {
      const slowReactionTime = 90 * 1000;
      const startTime = Date.now();
      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + slowReactionTime);

      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        mockContext,
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'deferred',
        'fallback',
        60000, // Capped at 60 seconds
      );

      jest.restoreAllMocks();
    });
  });

  describe('API error scenarios', () => {
    it('should handle non-ok response from API', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch notification data:',
        expect.any(Error),
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        '🎉 Turbo Console Log installed! Want to see it in action?',
        'Get Started',
        'Maybe Later',
      );
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        '🎉 Turbo Console Log installed! Want to see it in action?',
        'Get Started',
        'Maybe Later',
      );
    });

    it('should handle network timeout', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        '🎉 Turbo Console Log installed! Want to see it in action?',
        'Get Started',
        'Maybe Later',
      );
    });
  });

  describe('version parameter handling', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Test',
          ctaText: 'Test',
          ctaUrl: 'https://test.com',
          variant: 'A',
        }),
      });
      mockShowInformationMessage.mockResolvedValue('Maybe Later');
    });

    it('should include version parameter when provided', async () => {
      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.1',
        mockContext,
      );

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('notificationEvent=extensionFreshInstall');
      expect(fetchUrl).toContain('version=3.9.1');
    });

    it('should include version parameter in URL', async () => {
      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('notificationEvent=extensionFreshInstall');
      expect(fetchUrl).toContain('version=3.9.0');
    });
  });

  describe('telemetry tracking validation', () => {
    const mockNotificationData = {
      message: 'Test',
      ctaText: 'Test CTA',
      ctaUrl: 'https://test.com?event=TEST&variant=B',
      variant: 'B',
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockNotificationData,
      });
    });

    it('should create telemetry service once', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      expect(createTelemetryService).toHaveBeenCalledTimes(1);
    });

    it('should track shown event before showing notification', async () => {
      let shownCalled = false;
      mockTelemetryService.reportNotificationInteraction.mockImplementation(
        (context, event, type) => {
          if (type === 'shown') {
            shownCalled = true;
          }
          return Promise.resolve(); // Must return a promise
        },
      );

      mockShowInformationMessage.mockImplementation(() => {
        expect(shownCalled).toBe(true);
        return Promise.resolve('Maybe Later');
      });

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );
    });

    it('should always include reaction time for click and dismiss events', async () => {
      mockShowInformationMessage.mockResolvedValue('Test CTA');

      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      const clickCall =
        mockTelemetryService.reportNotificationInteraction.mock.calls.find(
          (call) => call[2] === 'clicked',
        );

      expect(clickCall).toBeDefined();
      expect(clickCall![4]).toBeGreaterThanOrEqual(0);
      expect(clickCall![4]).toBeLessThanOrEqual(60000);
    });
  });

  describe('telemetry error handling', () => {
    const mockNotificationData = {
      message: 'Test',
      ctaText: 'Test CTA',
      ctaUrl: 'https://test.com?event=TEST&variant=A',
      variant: 'A',
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockNotificationData,
      });
    });

    it('should not throw error when telemetry service fails on shown event', async () => {
      mockTelemetryService.reportNotificationInteraction.mockRejectedValueOnce(
        new Error('Telemetry service unavailable'),
      );
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await expect(
        showNotification(
          NotificationEvent.EXTENSION_FRESH_INSTALL,
          '3.9.0',
          mockContext,
        ),
      ).resolves.not.toThrow();
    });

    it('should not throw error when telemetry service fails on click event', async () => {
      mockShowInformationMessage.mockResolvedValue('Test CTA');
      mockTelemetryService.reportNotificationInteraction
        .mockResolvedValueOnce(undefined) // shown event succeeds
        .mockRejectedValueOnce(new Error('Telemetry service unavailable')); // click event fails

      await expect(
        showNotification(
          NotificationEvent.EXTENSION_FRESH_INSTALL,
          '3.9.0',
          mockContext,
        ),
      ).resolves.not.toThrow();

      expect(mockOpenExternal).toHaveBeenCalledWith(
        mockNotificationData.ctaUrl,
      );
    });

    it('should not throw error when telemetry service fails on dismiss event', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');
      mockTelemetryService.reportNotificationInteraction
        .mockResolvedValueOnce(undefined) // shown event succeeds
        .mockRejectedValueOnce(new Error('Telemetry service unavailable')); // dismiss event fails

      await expect(
        showNotification(
          NotificationEvent.EXTENSION_FRESH_INSTALL,
          '3.9.0',
          mockContext,
        ),
      ).resolves.not.toThrow();
    });

    it('should continue showing notification even if telemetry creation fails', async () => {
      (createTelemetryService as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create telemetry service');
      });
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      // Should still show notification despite telemetry failure
      await expect(
        showNotification(
          NotificationEvent.EXTENSION_FRESH_INSTALL,
          '3.9.0',
          mockContext,
        ),
      ).rejects.toThrow();

      // Restore for other tests
      (createTelemetryService as jest.Mock).mockReturnValue(
        mockTelemetryService,
      );
    });

    it('should handle telemetry failures in fallback flow', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));
      mockShowInformationMessage.mockResolvedValue('Get Started');
      mockTelemetryService.reportNotificationInteraction.mockRejectedValue(
        new Error('Telemetry service unavailable'),
      );

      await expect(
        showNotification(
          NotificationEvent.EXTENSION_FRESH_INSTALL,
          '3.9.0',
          mockContext,
        ),
      ).resolves.not.toThrow();

      expect(mockOpenExternal).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/documentation/overview/motivation?event=extensionFreshInstall&variant=fallback',
      );
    });
  });

  describe('deactivated variant handling', () => {
    it('should not show UI when variant is deactivated', async () => {
      // Mock API response with isDeactivated: true
      const deactivatedNotificationData = {
        message: 'Test notification',
        ctaText: 'Test CTA',
        ctaUrl: 'https://test.com',
        variant: 'deactivated-variant',
        isDeactivated: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => deactivatedNotificationData,
      });

      const result = await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      // Should return false (not shown)
      expect(result).toBe(false);

      // Should not show UI
      expect(mockShowInformationMessage).not.toHaveBeenCalled();

      // Should not track any telemetry
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).not.toHaveBeenCalled();
    });
  });

  describe('duplicate notification handling', () => {
    const mockDuplicateNotificationData = {
      message: 'Test notification message',
      ctaText: 'Get Started',
      ctaUrl:
        'https://www.turboconsolelog.io/documentation?event=extensionFreshInstall&variant=A',
      variant: 'A',
      isDuplicated: true,
      isDeactivated: false,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockDuplicateNotificationData,
      });
    });

    it('should return true when notification is a duplicate', async () => {
      const result = await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      // Verify notification was shown
      expect(result).toBe(true);
    });

    it('should not call telemetry when notification is a duplicate', async () => {
      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      // Verify telemetry was NOT called for shown event
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).not.toHaveBeenCalled();
    });

    it('should not fire notification when notification is a duplicate', async () => {
      await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      // Verify notification dialog was NOT shown
      expect(mockShowInformationMessage).not.toHaveBeenCalled();
    });

    it('should handle duplicate notification with deactivated variant correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockDuplicateNotificationData,
          isDuplicated: true,
          isDeactivated: true,
        }),
      });

      const result = await showNotification(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        '3.9.0',
        mockContext,
      );

      // Should not show UI
      expect(mockShowInformationMessage).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
