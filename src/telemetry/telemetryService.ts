import * as vscode from 'vscode';
import axios from 'axios';
import { generateDeveloperId } from '../helpers/generateDeveloperId';
import { getUserActivityStatus } from '../helpers/getUserActivityStatus';
import {
  TurboAnalyticsProvider,
  FreshInstallAnalyticsData,
  UpdateAnalyticsData,
  CommandsInsertedAnalyticsData,
  FreemiumPanelCtaClickAnalyticsData,
} from './TurboAnalyticsProvider';

// Type extension for VS Code env API compatibility
interface ExtendedEnv {
  isTelemetryEnabled?: boolean;
}

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Telemetry service implementation that respects VS Code and user privacy settings
 * Follows Microsoft's telemetry guidelines for VS Code extensions
 */
class TelemetryService implements TurboAnalyticsProvider {
  private readonly telemetryEnabled: boolean;
  private readonly customTelemetryEnabled: boolean;

  constructor() {
    // Check VS Code's global telemetry setting (with fallback for older versions)
    const extendedEnv = vscode.env as unknown as ExtendedEnv;
    this.telemetryEnabled = extendedEnv.isTelemetryEnabled ?? true;

    // Check our custom telemetry setting
    const config = vscode.workspace.getConfiguration('turboConsoleLog');
    this.customTelemetryEnabled = config.get('isTurboTelemetryEnabled', true);
  }

  private canSendTelemetry(): boolean {
    return this.telemetryEnabled && this.customTelemetryEnabled;
  }

  /**
   * Checks if the extension is running in Pro mode
   * Based on the presence of license key and pro bundle in global state
   */
  private checkProStatus(context: vscode.ExtensionContext): boolean {
    try {
      const proLicenseKey = context.globalState.get<string>('license-key');
      const proBundle = context.globalState.get<string>('pro-bundle');
      return !!(proLicenseKey && proBundle);
    } catch {
      return false;
    }
  }

  /**
   * Generates a stable, anonymous developer identifier
   * Uses machine-specific identifiers that remain consistent across sessions
   */
  private generateDeveloperId(): string {
    return generateDeveloperId();
  }

  public async reportFreshInstall(): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData: FreshInstallAnalyticsData = {
        developerId,
        installedAt: now,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportFreshInstall`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportUpdate(context: vscode.ExtensionContext): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const newVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;
      const isPro = this.checkProStatus(context);
      const activityStatus = getUserActivityStatus(context);

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData: UpdateAnalyticsData = {
        developerId,
        updatedAt: now,
        newVersion: newVersion || 'unknown',
        isPro,
        activityStatus,
        timezoneOffset,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportUpdate`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${newVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportCommandsInserted(
    context: vscode.ExtensionContext,
    count: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;
      const isPro = this.checkProStatus(context);

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData: CommandsInsertedAnalyticsData = {
        developerId,
        count,
        isPro,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
        updatedAt: now,
      };
      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportInsertionsCommandsCount`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportFreemiumPanelOpening(): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData = {
        developerId,
        openedAt: now,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportFreemiumPanelOpening`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportFreemiumPanelCtaClick(
    ctaType: string,
    ctaText: string,
    ctaUrl: string,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData: FreemiumPanelCtaClickAnalyticsData = {
        developerId,
        clickedAt: now,
        ctaType,
        ctaText,
        ctaUrl,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportFreemiumPanelCtaClick`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportNotificationInteraction(
    notificationEvent: string,
    interactionType: 'shown' | 'clicked' | 'dismissed' | 'deferred',
    variant: string,
    reactionTimeMs?: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      // Collect user context metadata for clicked, dismissed, and deferred events
      let openEditorsCount: number | undefined;
      let unsavedFilesCount: number | undefined;
      let terminalCount: number | undefined;
      let periodOfDay:
        | 'morning'
        | 'afternoon'
        | 'evening'
        | 'night'
        | undefined;
      let dayOfWeek:
        | 'MONDAY'
        | 'TUESDAY'
        | 'WEDNESDAY'
        | 'THURSDAY'
        | 'FRIDAY'
        | 'SATURDAY'
        | 'SUNDAY'
        | undefined;

      if (interactionType !== 'shown') {
        // Count all open tabs across all tab groups
        openEditorsCount = vscode.window.tabGroups.all.reduce(
          (count, group) => count + group.tabs.length,
          0,
        );

        // Count unsaved files across all open text documents
        unsavedFilesCount = vscode.workspace.textDocuments.filter(
          (doc) => doc.isDirty && doc.uri.scheme === 'file',
        ).length;

        // Count terminals
        terminalCount = vscode.window.terminals.length;

        // Calculate period of day based on local time
        const hour = now.getHours();
        if (hour >= 5 && hour < 12) {
          periodOfDay = 'morning';
        } else if (hour >= 12 && hour < 17) {
          periodOfDay = 'afternoon';
        } else if (hour >= 17 && hour < 21) {
          periodOfDay = 'evening';
        } else {
          periodOfDay = 'night';
        }

        // Get day of week
        const dayNames: (
          | 'SUNDAY'
          | 'MONDAY'
          | 'TUESDAY'
          | 'WEDNESDAY'
          | 'THURSDAY'
          | 'FRIDAY'
          | 'SATURDAY'
        )[] = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ];
        dayOfWeek = dayNames[now.getDay()];
      }

      const analyticsData = {
        developerId,
        notificationEvent,
        interactionType,
        variant,
        reactionTimeMs,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
        ...(openEditorsCount !== undefined && { openEditorsCount }),
        ...(unsavedFilesCount !== undefined && { unsavedFilesCount }),
        ...(terminalCount !== undefined && { terminalCount }),
        ...(periodOfDay && { periodOfDay }),
        ...(dayOfWeek && { dayOfWeek }),
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportNotificationInteraction`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportWebviewInteraction(
    version: string,
    variant: string,
    interactionType: 'shown' | 'clicked',
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData = {
        developerId,
        version,
        variant,
        interactionType,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportWebviewInteraction`,
        analyticsData,
        {
          timeout: 5000, // 5 second timeout to avoid blocking the extension
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportNotificationLimitReached(
    monthKey: string,
    currentCount: number,
    maxLimit: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData = {
        developerId,
        monthKey,
        currentCount,
        maxLimit,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportNotificationLimitReached`,
        analyticsData,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  public async reportNotificationsPaused(
    monthKey: string,
    consecutiveDismissals: number,
    pausedUntil: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        return;
      }

      const developerId = this.generateDeveloperId();
      const extensionVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData = {
        developerId,
        monthKey,
        consecutiveDismissals,
        pausedUntil,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };
      // Send the analytics data to the endpoint
      await axios.post(
        `${TURBO_WEBSITE_BASE_URL}/api/reportNotificationsPaused`,
        analyticsData,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `turbo-console-log-extension/${extensionVersion}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
    }
  }

  dispose(): void {
    // No cleanup needed since we removed the event listeners
    // This method is kept for interface compatibility
  }
}

/**
 * Singleton instance of the telemetry service
 */
let telemetryServiceInstance: TurboAnalyticsProvider | null = null;

/**
 * Factory function to create or return the singleton telemetry service instance
 * This allows for better testing and dependency injection while ensuring only one instance exists
 */
export function createTelemetryService(): TurboAnalyticsProvider {
  if (!telemetryServiceInstance) {
    telemetryServiceInstance = new TelemetryService();
  }
  return telemetryServiceInstance;
}

/**
 * Reset the singleton instance (primarily for testing)
 */
export function resetTelemetryService(): void {
  telemetryServiceInstance = null;
}
