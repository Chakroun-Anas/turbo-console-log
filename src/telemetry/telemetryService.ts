import * as vscode from 'vscode';
import axios from 'axios';
import * as crypto from 'crypto';
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
    try {
      // Use stable identifiers that don't change between VS Code sessions
      const machineId = vscode.env.machineId || 'unknown-machine';
      const language = vscode.env.language || 'unknown-language';
      const platform = process.platform || 'unknown-platform';
      const arch = process.arch || 'unknown-arch';

      // Create a stable identifier combining machine-specific data
      const combined = [
        machineId,
        language,
        platform,
        arch,
        'turbo-console-log-stable', // Extension-specific salt
      ].join('-');

      // Use crypto for a proper hash if available, fallback to simple hash
      let developerId: string;

      if (crypto && crypto.createHash) {
        // Use SHA256 for better distribution and collision resistance
        developerId = crypto
          .createHash('sha256')
          .update(combined)
          .digest('hex')
          .substring(0, 16); // Use first 16 characters for reasonable length
      } else {
        // Fallback for environments where crypto is not available
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        developerId = Math.abs(hash).toString(36);
      }

      return `dev_${developerId}`;
    } catch {
      // Ultimate fallback - use machineId directly if available
      const machineId = vscode.env.machineId;
      if (machineId && machineId !== 'unknown-machine') {
        return `dev_machine_${machineId.substring(0, 16)}`;
      }

      // Last resort fallback - use timestamp + random for uniqueness
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `dev_fallback_${timestamp}_${random}`;
    }
  }

  public async reportFreshInstall(): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping fresh install reporting',
        );
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

      console.log('[Turbo Console Log] Sending fresh install analytics data:', {
        developerId,
        extensionVersion,
        vscodeVersion,
        platform,
        installedAt: analyticsData.installedAt.toISOString(),
        timezoneOffset: timezoneOffset,
      });

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

      console.log('[Turbo Console Log] Fresh install report sent successfully');
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send fresh install analytics:',
        error,
      );
    }
  }

  public async reportUpdate(context: vscode.ExtensionContext): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping update reporting',
        );
        return;
      }

      const developerId = this.generateDeveloperId();
      const newVersion = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;
      const vscodeVersion = vscode.version;
      const platform = process.platform;
      const isPro = this.checkProStatus(context);

      // Get current time and timezone information
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const analyticsData: UpdateAnalyticsData = {
        developerId,
        updatedAt: now,
        newVersion: newVersion || 'unknown',
        isPro,
        timezoneOffset,
        vscodeVersion,
        platform,
      };

      console.log('[Turbo Console Log] Sending update analytics data:', {
        developerId,
        newVersion,
        isPro,
        vscodeVersion,
        platform,
        updatedAt: analyticsData.updatedAt.toISOString(),
        timezoneOffset: timezoneOffset,
      });

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

      console.log('[Turbo Console Log] Update analytics sent successfully');
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send update analytics:',
        error,
      );
    }
  }

  public async reportCommandsInserted(
    context: vscode.ExtensionContext,
    count: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping commands inserted reporting',
        );
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

      console.log(
        '[Turbo Console Log] Sending commands inserted analytics data:',
        {
          developerId,
          count,
          isPro,
          extensionVersion,
          vscodeVersion,
          platform,
          updatedAt: analyticsData.updatedAt.toISOString(),
          timezoneOffset: timezoneOffset,
        },
      );

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

      console.log(
        '[Turbo Console Log] Commands inserted analytics sent successfully',
      );
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send commands inserted analytics:',
        error,
      );
    }
  }

  public async reportFreemiumPanelOpening(): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping freemium panel opening reporting',
        );
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

      console.log(
        '[Turbo Console Log] Sending freemium panel opening analytics data:',
        {
          developerId,
          extensionVersion,
          vscodeVersion,
          platform,
          openedAt: analyticsData.openedAt.toISOString(),
          timezoneOffset: timezoneOffset,
        },
      );

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

      console.log(
        '[Turbo Console Log] Freemium panel opening report sent successfully',
      );
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send freemium panel opening analytics:',
        error,
      );
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
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping freemium panel CTA click reporting',
        );
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

      console.log(
        '[Turbo Console Log] Sending freemium panel CTA click analytics data:',
        {
          developerId,
          ctaType,
          ctaText,
          ctaUrl,
          extensionVersion,
          vscodeVersion,
          platform,
          clickedAt: analyticsData.clickedAt.toISOString(),
          timezoneOffset: timezoneOffset,
        },
      );

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

      console.log(
        '[Turbo Console Log] Freemium panel CTA click report sent successfully',
      );
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send freemium panel CTA click analytics:',
        error,
      );
    }
  }

  public async reportNotificationInteraction(
    notificationEvent: string,
    interactionType: 'shown' | 'clicked' | 'dismissed',
    variant: string,
    reactionTimeMs?: number,
  ): Promise<void> {
    try {
      // Check if telemetry is enabled before proceeding
      if (!this.canSendTelemetry()) {
        console.log(
          '[Turbo Console Log] Telemetry is disabled, skipping notification interaction reporting',
        );
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
        notificationEvent,
        interactionType,
        variant,
        reactionTimeMs,
        timezoneOffset,
        extensionVersion,
        vscodeVersion,
        platform,
      };

      console.log(
        '[Turbo Console Log] Sending notification interaction analytics data:',
        {
          developerId,
          notificationEvent,
          interactionType,
          variant,
          reactionTimeMs,
          extensionVersion,
          vscodeVersion,
          platform,
          timezoneOffset: timezoneOffset,
        },
      );

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

      console.log(
        `[Turbo Console Log] Notification interaction (${interactionType}) report sent successfully for variant ${variant}`,
      );
    } catch (error) {
      // Silently fail to ensure extension functionality is not affected
      // Only log to console for debugging purposes
      console.warn(
        '[Turbo Console Log] Failed to send notification interaction analytics:',
        error,
      );
    }
  }

  public dispose(): void {
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
