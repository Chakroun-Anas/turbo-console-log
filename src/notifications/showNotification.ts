import vscode from 'vscode';
import { NotificationEvent } from './NotificationEvent';
import { ExtensionNotificationResponse } from './ExtensionNotificationResponse';
import { createTelemetryService } from '../telemetry/telemetryService';
import { generateDeveloperId } from '../helpers/generateDeveloperId';
import { writeToGlobalState } from '../helpers/writeToGlobalState';
import { GlobalStateKey } from '@/entities';
import { TurboAnalyticsProvider } from '@/telemetry';
import { isTestMode } from '@/runTime';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

export async function showNotification(
  notificationEvent: NotificationEvent,
  version: string,
  context: vscode.ExtensionContext,
): Promise<boolean> {
  // Fetch notification
  let notificationData: ExtensionNotificationResponse | null = null;
  try {
    notificationData = await fetchNotificationData(notificationEvent, version);
  } catch (error) {
    console.error('Failed to fetch notification data:', error);

    // Define fallback messages per event type
    // v3.21.2: Reduced to 6 core notification events
    const fallbackMessages: Record<
      NotificationEvent,
      { message: string; ctaText: string; ctaUrl: string }
    > = {
      [NotificationEvent.EXTENSION_FRESH_INSTALL]: {
        message: '🎉 Turbo Console Log installed! Want to see it in action?',
        ctaText: 'Get Started',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/overview/motivation`,
      },
      [NotificationEvent.EXTENSION_PHP_PRO_ONLY]: {
        message:
          '💡 Want to debug PHP with Turbo? This feature is available in Pro.',
        ctaText: 'Upgrade Now',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG]: {
        message:
          '💡 Still typing console.log()? Save time with Turbo! Insert logs 10x faster.',
        ctaText: 'See How',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/insert-log-message`,
      },
      [NotificationEvent.EXTENSION_INACTIVE_TWO_WEEKS_RETURN]: {
        message:
          '👋 Welcome back! Speed up debugging with Turbo. Try Ctrl+Alt+L on any variable.',
        ctaText: 'Quick Refresher',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/insert-log-message`,
      },
      [NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN]: {
        message:
          '💡 Ready to try? Select any variable → Insert a log → Experience faster debugging!',
        ctaText: 'See How It Works',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/insert-log-message`,
      },
      [NotificationEvent.EXTENSION_RELEASE_ANNOUNCEMENT]: {
        message:
          '🔥 v3.21.0: 15-20x performance gains with video proof. See it yourself!',
        ctaText: 'See The Gains',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/articles/release-3210`,
      },
    };

    const fallback = fallbackMessages[notificationEvent];

    notificationData = {
      message: fallback.message,
      ctaText: fallback.ctaText,
      ctaUrl: fallback.ctaUrl,
      variant: 'fallback',
      isDeactivated: false,
      isDuplicated: false,
    };
  }

  // If notification is a duplicate (already shown today), return true to acknowledge
  // Since Turbo v3.14.0 - Backend deduplication prevents duplicate notifications
  if (notificationData.isDuplicated) {
    return true; // Already shown/handled by backend duplicate detection
  }

  if (notificationData.isDeactivated) {
    // Variant is deactivated, don't show notification
    return false;
  }

  const telemetryService = createTelemetryService();
  telemetryService
    .reportNotificationInteraction(
      context,
      notificationEvent,
      'shown',
      notificationData.variant,
    )
    .catch((err) =>
      console.warn('Failed to report notification shown event:', err),
    );
  fireNotificationInBackground(
    context,
    telemetryService,
    notificationEvent,
    notificationData,
  ).catch((err) =>
    console.error('Error in fireNotificationInBackground:', err),
  );

  return true; // Notification was shown
}

async function fetchNotificationData(
  notificationEvent: NotificationEvent,
  version?: string,
): Promise<ExtensionNotificationResponse> {
  const params = new URLSearchParams({
    notificationEvent: notificationEvent,
  });

  if (version) {
    params.append('version', version);
  }

  // v3.21.2: Removed count parameter handling for deleted events
  // (workspace log threshold, commented logs, duplicate logs, hot folder)

  const developerId = generateDeveloperId();
  params.append('developerId', developerId);

  // Add VS Code metadata for duplicate tracking
  params.append('vscodeVersion', vscode.version);
  params.append('platform', process.platform);
  params.append('timezoneOffset', new Date().getTimezoneOffset().toString());

  const url = `${TURBO_WEBSITE_BASE_URL}/api/extensionNotification?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

async function fireNotificationInBackground(
  context: vscode.ExtensionContext,
  telemetryService: TurboAnalyticsProvider,
  notificationEvent: NotificationEvent,
  notificationData: ExtensionNotificationResponse,
): Promise<void> {
  // Cap reaction time to exclude stale time when users are away
  const MAX_MEANINGFUL_REACTION_TIME_MS = 60 * 1000; // 60 seconds
  try {
    // Record start time for reaction time measurement
    const startTime = Date.now();

    // Show notification with CTA
    const action = await vscode.window.showInformationMessage(
      notificationData.message,
      notificationData.ctaText,
      'Maybe Later',
    );

    // Calculate reaction time (cap at 60 seconds to exclude stale time)
    const rawReactionTimeMs = Date.now() - startTime;
    const reactionTimeMs = Math.min(
      rawReactionTimeMs,
      MAX_MEANINGFUL_REACTION_TIME_MS,
    );

    if (action === notificationData.ctaText) {
      // Track CTA click with reaction time (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
          context,
          notificationEvent,
          'clicked',
          notificationData.variant,
          reactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report notification click event:', err),
        );

      // Open the CTA URL in external browser
      await vscode.env.openExternal(
        vscode.Uri.parse(
          notificationData.variant !== 'fallback'
            ? notificationData.ctaUrl
            : `${notificationData.ctaUrl}?event=${notificationEvent}&variant=fallback`,
        ),
      );
    } else if (action === 'I already did') {
      // User indicated they already subscribed - no need to track as dismissal
      if (context) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER,
          true,
        );
      }
    } else if (action === 'Maybe Later') {
      // Track deferral with reaction time for analytics (fire-and-forget with error handling)
      // Note: "Maybe Later" is a polite, engaged deferral - user is interested but not ready now
      // We track it separately from dismissals to measure soft interest vs hard rejection
      telemetryService
        .reportNotificationInteraction(
          context,
          notificationEvent,
          'deferred',
          notificationData.variant,
          reactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report notification deferred event:', err),
        );

      // "Maybe Later" does NOT record dismissal - it's not a signal of annoyance
      // Only implicit dismissals (X button) should count toward pause threshold
    } else {
      // Implicit dismissal (X button) - strong annoyance signal
      // Track with reaction time (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
          context,
          notificationEvent,
          'dismissed',
          notificationData.variant,
          reactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report notification dismiss event:', err),
        );
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}
