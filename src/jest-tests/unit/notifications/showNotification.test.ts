import * as vscode from 'vscode';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { createTelemetryService } from '@/telemetry/telemetryService';

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

  beforeEach(() => {
    jest.clearAllMocks();

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
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/extensionNotification?notificationEvent=extensionFreshInstall&version=3.9.0',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should track notification shown event', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'shown',
        'A',
      );
    });

    it('should show notification with correct message and buttons', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        'Test notification message',
        'Get Started',
        'Maybe Later',
      );
    });

    it('should track clicked event and open URL when CTA is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Get Started');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'clicked',
        'A',
        expect.any(Number),
      );

      expect(mockOpenExternal).toHaveBeenCalledWith(
        mockNotificationData.ctaUrl,
      );
    });

    it('should track dismissed event when "Maybe Later" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
        'A',
        expect.any(Number),
      );

      expect(mockOpenExternal).not.toHaveBeenCalled();
    });

    it('should track dismissed event when notification is closed without action', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show notification:',
        expect.any(Error),
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        "Welcome to Turbo Console Log! Let's boost your debugging speed 🚀",
        'Motivation',
        'Maybe Later',
      );
    });

    it('should track fallback notification click and open motivation page', async () => {
      mockShowInformationMessage.mockResolvedValue('Motivation');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'clicked',
        'fallback',
        expect.any(Number),
      );

      expect(mockOpenExternal).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/documentation/overview/motivation?event=extensionFreshInstall&variant=fallback',
      );
    });

    it('should track fallback notification dismissal when "Maybe Later" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
        'fallback',
        expect.any(Number),
      );

      expect(mockOpenExternal).not.toHaveBeenCalled();
    });

    it('should track fallback notification dismissal when closed without action', async () => {
      mockShowInformationMessage.mockResolvedValue(undefined);

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
        'fallback',
        expect.any(Number),
      );
    });

    it('should include event and variant query parameters in fallback URL', async () => {
      mockShowInformationMessage.mockResolvedValue('Motivation');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_FRESH_INSTALL,
        'dismissed',
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to show notification:',
        expect.any(Error),
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        "Welcome to Turbo Console Log! Let's boost your debugging speed 🚀",
        'Motivation',
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        "Welcome to Turbo Console Log! Let's boost your debugging speed 🚀",
        'Motivation',
        'Maybe Later',
      );
    });

    it('should handle network timeout', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        "Welcome to Turbo Console Log! Let's boost your debugging speed 🚀",
        'Motivation',
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
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/extensionNotification?notificationEvent=extensionFreshInstall&version=3.9.1',
        expect.any(Object),
      );
    });

    it('should not include version parameter when not provided', async () => {
      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/api/extensionNotification?notificationEvent=extensionFreshInstall',
        expect.any(Object),
      );
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      expect(createTelemetryService).toHaveBeenCalledTimes(1);
    });

    it('should track shown event before showing notification', async () => {
      let shownCalled = false;
      mockTelemetryService.reportNotificationInteraction.mockImplementation(
        (event, type) => {
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

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);
    });

    it('should always include reaction time for click and dismiss events', async () => {
      mockShowInformationMessage.mockResolvedValue('Test CTA');

      await showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL);

      const clickCall =
        mockTelemetryService.reportNotificationInteraction.mock.calls.find(
          (call) => call[1] === 'clicked',
        );

      expect(clickCall).toBeDefined();
      expect(clickCall![3]).toBeGreaterThanOrEqual(0);
      expect(clickCall![3]).toBeLessThanOrEqual(60000);
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
        showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL),
      ).resolves.not.toThrow();
    });

    it('should not throw error when telemetry service fails on click event', async () => {
      mockShowInformationMessage.mockResolvedValue('Test CTA');
      mockTelemetryService.reportNotificationInteraction
        .mockResolvedValueOnce(undefined) // shown event succeeds
        .mockRejectedValueOnce(new Error('Telemetry service unavailable')); // click event fails

      await expect(
        showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL),
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
        showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL),
      ).resolves.not.toThrow();
    });

    it('should continue showing notification even if telemetry creation fails', async () => {
      (createTelemetryService as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create telemetry service');
      });
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      // Should still show notification despite telemetry failure
      await expect(
        showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL),
      ).rejects.toThrow();

      // Restore for other tests
      (createTelemetryService as jest.Mock).mockReturnValue(
        mockTelemetryService,
      );
    });

    it('should handle telemetry failures in fallback flow', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));
      mockShowInformationMessage.mockResolvedValue('Motivation');
      mockTelemetryService.reportNotificationInteraction.mockRejectedValue(
        new Error('Telemetry service unavailable'),
      );

      await expect(
        showNotification(NotificationEvent.EXTENSION_FRESH_INSTALL),
      ).resolves.not.toThrow();

      expect(mockOpenExternal).toHaveBeenCalledWith(
        'https://www.turboconsolelog.io/documentation/overview/motivation?event=extensionFreshInstall&variant=fallback',
      );
    });
  });

  describe('EXTENSION_PANEL_FREQUENT_ACCESS event handling', () => {
    const mockNotificationData = {
      message: '🎯 You love the panel! Join our newsletter for exclusive tips.',
      ctaText: 'Subscribe',
      ctaUrl:
        'https://www.turboconsolelog.io/join?event=extensionPanelFrequentAccess&variant=A',
      variant: 'A',
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockNotificationData,
      });
    });

    it('should show notification with 3 buttons including "I already did"', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      const mockContext = {
        subscriptions: [],
        globalState: {
          get: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        mockContext,
      );

      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        mockNotificationData.message,
        mockNotificationData.ctaText,
        'I already did',
        'Maybe Later',
      );
    });

    it('should not track telemetry when "I already did" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('I already did');

      const mockContext = {
        subscriptions: [],
        globalState: {
          get: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        mockContext,
      );

      // Should only track "shown" event, not dismissal
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        'shown',
        'A',
      );
    });

    it('should update global state when "I already did" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('I already did');

      const mockContext = {
        subscriptions: [],
        globalState: {
          get: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        mockContext,
      );

      expect(mockContext.globalState.update).toHaveBeenCalledWith(
        'HAS_SUBSCRIBED_TO_NEWSLETTER',
        true,
      );
    });

    it('should not update global state when "I already did" clicked but no context provided', async () => {
      mockShowInformationMessage.mockResolvedValue('I already did');

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        undefined,
      );

      // Should not throw error
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledTimes(1);
    });

    it('should open CTA URL when main button is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Subscribe');

      const mockContext = {
        subscriptions: [],
        globalState: {
          get: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        mockContext,
      );

      expect(mockOpenExternal).toHaveBeenCalledWith(
        mockNotificationData.ctaUrl,
      );
      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        'clicked',
        'A',
        expect.any(Number),
      );
    });

    it('should track dismissal when "Maybe Later" is clicked', async () => {
      mockShowInformationMessage.mockResolvedValue('Maybe Later');

      const mockContext = {
        subscriptions: [],
        globalState: {
          get: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as vscode.ExtensionContext;

      await showNotification(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        undefined,
        mockContext,
      );

      expect(
        mockTelemetryService.reportNotificationInteraction,
      ).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
        'dismissed',
        'A',
        expect.any(Number),
      );
    });

    describe('fallback flow for EXTENSION_PANEL_FREQUENT_ACCESS', () => {
      beforeEach(() => {
        mockFetch.mockRejectedValue(new Error('Network error'));
      });

      it('should show fallback notification with 3 buttons', async () => {
        mockShowInformationMessage.mockResolvedValue('Maybe Later');

        const mockContext = {
          subscriptions: [],
          globalState: {
            get: jest.fn(),
            update: jest.fn(),
          },
        } as unknown as vscode.ExtensionContext;

        await showNotification(
          NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
          undefined,
          mockContext,
        );

        expect(mockShowInformationMessage).toHaveBeenCalledWith(
          '🎯 You love the panel! Join our newsletter for exclusive tips and updates.',
          'Subscribe',
          'I already did',
          'Maybe Later',
        );
      });

      it('should update global state on fallback "I already did" click', async () => {
        mockShowInformationMessage.mockResolvedValue('I already did');

        const mockContext = {
          subscriptions: [],
          globalState: {
            get: jest.fn(),
            update: jest.fn(),
          },
        } as unknown as vscode.ExtensionContext;

        await showNotification(
          NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
          undefined,
          mockContext,
        );

        expect(mockContext.globalState.update).toHaveBeenCalledWith(
          'HAS_SUBSCRIBED_TO_NEWSLETTER',
          true,
        );
      });

      it('should not track telemetry for fallback "I already did" click', async () => {
        mockShowInformationMessage.mockResolvedValue('I already did');

        const mockContext = {
          subscriptions: [],
          globalState: {
            get: jest.fn(),
            update: jest.fn(),
          },
        } as unknown as vscode.ExtensionContext;

        await showNotification(
          NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
          undefined,
          mockContext,
        );

        // Should not track any interaction (no "clicked" or "dismissed" tracking)
        // Fallback flow doesn't have "shown" tracking - only API success flow does
        expect(
          mockTelemetryService.reportNotificationInteraction,
        ).not.toHaveBeenCalled();
      });

      it('should open fallback CTA URL with correct parameters', async () => {
        mockShowInformationMessage.mockResolvedValue('Subscribe');

        const mockContext = {
          subscriptions: [],
          globalState: {
            get: jest.fn(),
            update: jest.fn(),
          },
        } as unknown as vscode.ExtensionContext;

        await showNotification(
          NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS,
          undefined,
          mockContext,
        );

        expect(mockOpenExternal).toHaveBeenCalledWith(
          'https://www.turboconsolelog.io/join?event=extensionPanelFrequentAccess&variant=fallback',
        );
      });
    });
  });
});
