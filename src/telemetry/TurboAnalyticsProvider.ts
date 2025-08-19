import type { ExtensionContext } from 'vscode';

/**
 * Interface for Turbo Console Log analytics provider operations
 * Provides contract for analytics services while respecting privacy settings
 */
export interface TurboAnalyticsProvider {
  /**
   * Reports fresh installation of the extension
   * Only sends data if both VS Code telemetry and custom telemetry are enabled
   */
  reportFreshInstall(): Promise<void>;

  /**
   * Reports extension update events
   * Only sends data if both VS Code telemetry and custom telemetry are enabled
   */
  reportUpdate(context: ExtensionContext): Promise<void>;

  /**
   * Dispose of any resources and event listeners
   * Should be called when the extension is deactivated
   */
  dispose(): void;
}

/**
 * Data structure for fresh install analytics
 */
export interface FreshInstallAnalyticsData {
  developerId: string;
  installedAt: Date;
  timezoneOffset: number;
  extensionVersion?: string;
  vscodeVersion?: string;
  platform?: string;
}

/**
 * Data structure for extension update analytics
 */
export interface UpdateAnalyticsData {
  developerId: string;
  updatedAt: Date;
  newVersion: string;
  isPro: boolean;
  timezoneOffset?: number;
  vscodeVersion?: string;
  platform?: string;
}
