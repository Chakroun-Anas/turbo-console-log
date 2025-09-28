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
   * Reports when a new user has inserted 10 commands
   * Only sends data if both VS Code telemetry and custom telemetry are enabled
   */
  reportCommandsInserted(
    context: ExtensionContext,
    count: number,
  ): Promise<void>;

  /**
   * Reports freemium panel opening events
   * Only sends data if both VS Code telemetry and custom telemetry are enabled
   */
  reportFreemiumPanelOpening(): Promise<void>;

  /**
   * Reports freemium panel CTA button clicks
   * Only sends data if both VS Code telemetry and custom telemetry are enabled
   */
  reportFreemiumPanelCtaClick(
    ctaType: string,
    ctaText: string,
    ctaUrl: string,
  ): Promise<void>;

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

/**
 * Data structure for commands inserted analytics
 */
export interface CommandsInsertedAnalyticsData {
  developerId: string;
  count: number;
  isPro: boolean;
  timezoneOffset?: number;
  extensionVersion?: string;
  vscodeVersion?: string;
  platform?: string;
  updatedAt: Date;
}

/**
 * Data structure for freemium panel opening analytics
 */
export interface FreemiumPanelOpeningAnalyticsData {
  developerId: string;
  openedAt: Date;
  timezoneOffset?: number;
  extensionVersion?: string;
  vscodeVersion?: string;
  platform?: string;
}

/**
 * Data structure for freemium panel CTA click analytics
 */
export interface FreemiumPanelCtaClickAnalyticsData {
  developerId: string;
  clickedAt: Date;
  ctaType: string;
  ctaText: string;
  ctaUrl: string;
  timezoneOffset?: number;
  extensionVersion?: string;
  vscodeVersion?: string;
  platform?: string;
}
