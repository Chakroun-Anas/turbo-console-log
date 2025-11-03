import vscode from 'vscode';
import { NotificationEvent } from './NotificationEvent';
import { ExtensionNotificationResponse } from './ExtensionNotificationResponse';
import { createTelemetryService } from '../telemetry/telemetryService';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

export async function showNotification(
  notificationEvent: NotificationEvent,
  version?: string,
): Promise<void> {
  const telemetryService = createTelemetryService();
  let notificationData: ExtensionNotificationResponse | null = null;

  // Cap reaction time to exclude stale time when users are away
  const MAX_MEANINGFUL_REACTION_TIME_MS = 60 * 1000; // 60 seconds

  try {
    // Fetch notification data from the endpoint
    notificationData = await fetchNotificationData(notificationEvent, version);

    // Track that notification was shown (fire-and-forget with error handling)
    telemetryService
      .reportNotificationInteraction(
        notificationEvent,
        'shown',
        notificationData.variant,
      )
      .catch((err) =>
        console.warn('Failed to report notification shown event:', err),
      );

    // Record start time for reaction time measurement
    const startTime = Date.now();

    // Show notification with CTA
    const action = await vscode.window.showInformationMessage(
      notificationData.message,
      notificationData.ctaText,
      'Maybe Later',
    );
    console.log(
      '🚀 ~ showNotification.ts:44 ~ showNotification ~ action:',
      action,
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
          notificationEvent,
          'clicked',
          notificationData.variant,
          reactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report notification click event:', err),
        );

      // Open the CTA URL in external browser
      await vscode.env.openExternal(vscode.Uri.parse(notificationData.ctaUrl));
    } else if (action === 'Maybe Later') {
      // Track explicit dismissal with reaction time (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
          notificationEvent,
          'dismissed',
          notificationData.variant,
          reactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report notification dismiss event:', err),
        );
    } else {
      // Track notification closed without clicking any button (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
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
    console.error('Failed to show notification:', error);

    // Fallback to static message if API fails
    const fallbackStartTime = Date.now();
    const fallbackAction = await vscode.window.showInformationMessage(
      "Welcome to Turbo Console Log! Let's boost your debugging speed 🚀",
      'Motivation',
      'Maybe Later',
    );
    const rawFallbackReactionTimeMs = Date.now() - fallbackStartTime;
    const fallbackReactionTimeMs = Math.min(
      rawFallbackReactionTimeMs,
      MAX_MEANINGFUL_REACTION_TIME_MS,
    );

    // Track fallback notification interaction with default variant
    const defaultVariant = 'fallback';
    if (fallbackAction === 'Motivation') {
      telemetryService
        .reportNotificationInteraction(
          notificationEvent,
          'clicked',
          defaultVariant,
          fallbackReactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report fallback click event:', err),
        );

      // Open the motivation URL in external browser
      await vscode.env.openExternal(
        vscode.Uri.parse(
          `https://www.turboconsolelog.io/documentation/overview/motivation?event=${notificationEvent}&variant=${defaultVariant}`,
        ),
      );
    } else if (fallbackAction === 'Maybe Later') {
      // Track explicit dismissal with reaction time (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
          notificationEvent,
          'dismissed',
          defaultVariant,
          fallbackReactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report fallback dismiss event:', err),
        );
    } else {
      // Track notification closed without clicking any button (fire-and-forget with error handling)
      telemetryService
        .reportNotificationInteraction(
          notificationEvent,
          'dismissed',
          defaultVariant,
          fallbackReactionTimeMs,
        )
        .catch((err) =>
          console.warn('Failed to report fallback dismiss event:', err),
        );
    }
  }
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
