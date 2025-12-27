import vscode from 'vscode';
import { NotificationEvent } from './NotificationEvent';
import { ExtensionNotificationResponse } from './ExtensionNotificationResponse';
import { createTelemetryService } from '../telemetry/telemetryService';
import { writeToGlobalState } from '../helpers/writeToGlobalState';
import { GlobalStateKey } from '@/entities';
import {
  shouldShowNotification,
  recordNotificationShown,
} from './notificationCooldown';

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

export async function showNotification(
  notificationEvent: NotificationEvent,
  version: string,
  context: vscode.ExtensionContext,
): Promise<boolean> {
  // Check cooldown system
  if (!shouldShowNotification(context, notificationEvent)) {
    return false; // Not shown due to cooldown
  }

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
    // For panel frequent access, add "I already did" option
    const action =
      notificationEvent === NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS
        ? await vscode.window.showInformationMessage(
            notificationData.message,
            notificationData.ctaText,
            'I already did',
            'Maybe Later',
          )
        : await vscode.window.showInformationMessage(
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

    // Define fallback messages per event type
    const fallbackMessages: Record<
      NotificationEvent,
      { message: string; ctaText: string; ctaUrl: string }
    > = {
      [NotificationEvent.EXTENSION_FRESH_INSTALL]: {
        message: '🎉 Turbo Console Log installed! Want to see it in action?',
        ctaText: 'Get Started',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/overview/motivation`,
      },
      [NotificationEvent.EXTENSION_TEN_INSERTS]: {
        message:
          '🎓 10 logs already! Did you know you can comment or delete them all at once?',
        ctaText: 'Discover Features',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/comment-inserted-log-messages`,
      },
      [NotificationEvent.EXTENSION_FIFTY_INSERTS]: {
        message:
          '💪 50 logs! Most users unlock the central log panel at this point. Curious why?',
        ctaText: 'Show Me',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS]: {
        message:
          "🔥 You're exploring the panel a lot. Turbo PRO shows ALL logs from ALL files instantly.",
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_PHP_WORKSPACE_DETECTED]: {
        message:
          '🚀 Debug PHP with the speed you love! Turbo Pro now supports PHP logging.',
        ctaText: 'Upgrade Now',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_PHP_PRO_ONLY]: {
        message:
          '💡 Want to debug PHP with Turbo? This feature is available in Pro.',
        ctaText: 'Upgrade Now',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_FIVE_LOG_MANAGEMENT_COMMANDS]: {
        message:
          '🔥 Managing logs manually? Turbo PRO lets you clean them in bulk directly from the panel.',
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_FIVE_COMMENTS_COMMANDS]: {
        message:
          '🔥 Commenting logs manually? Turbo PRO lets you manage them in bulk directly from the panel.',
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_FIVE_UNCOMMENTS_COMMANDS]: {
        message:
          '🔥 Uncommenting logs manually? Turbo PRO lets you manage them in bulk directly from the panel.',
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_FIVE_CORRECTIONS_COMMANDS]: {
        message:
          '🔥 Correcting logs manually? Turbo PRO lets you manage them in bulk directly from the panel.',
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_FIVE_DELETE_COMMANDS]: {
        message:
          '🔥 Deleting logs manually? Turbo PRO lets you clean them in bulk directly from the panel.',
        ctaText: 'See It In Action',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
    };

    const fallback = fallbackMessages[notificationEvent];
    const fallbackStartTime = Date.now();
    const fallbackAction =
      notificationEvent === NotificationEvent.EXTENSION_PANEL_FREQUENT_ACCESS
        ? await vscode.window.showInformationMessage(
            fallback.message,
            fallback.ctaText,
            'I already did',
            'Maybe Later',
          )
        : await vscode.window.showInformationMessage(
            fallback.message,
            fallback.ctaText,
            'Maybe Later',
          );
    const rawFallbackReactionTimeMs = Date.now() - fallbackStartTime;
    const fallbackReactionTimeMs = Math.min(
      rawFallbackReactionTimeMs,
      MAX_MEANINGFUL_REACTION_TIME_MS,
    );

    // Track fallback notification interaction with default variant
    const defaultVariant = 'fallback';
    if (fallbackAction === fallback.ctaText) {
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

      // Open the CTA URL in external browser
      await vscode.env.openExternal(
        vscode.Uri.parse(
          `${fallback.ctaUrl}?event=${notificationEvent}&variant=${defaultVariant}`,
        ),
      );
    } else if (fallbackAction === 'I already did') {
      // User indicated they already subscribed - no need to track as dismissal
      if (context) {
        writeToGlobalState(
          context,
          GlobalStateKey.HAS_SUBSCRIBED_TO_NEWSLETTER,
          true,
        );
      }
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

  // Record that a notification was shown (updates cooldown timestamp)
  recordNotificationShown(context);
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
