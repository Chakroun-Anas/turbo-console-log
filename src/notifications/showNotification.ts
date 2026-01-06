import vscode from 'vscode';
import { NotificationEvent } from './NotificationEvent';
import { ExtensionNotificationResponse } from './ExtensionNotificationResponse';
import { createTelemetryService } from '../telemetry/telemetryService';
import { writeToGlobalState } from '../helpers/writeToGlobalState';
import { GlobalStateKey } from '@/entities';
import {
  shouldShowNotification,
  recordNotificationShown,
  recordDismissal,
  resetDismissalCounter,
  undoNotificationRecording,
} from './notificationCooldown';
import { TurboAnalyticsProvider } from '@/telemetry';

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

  // Record that a notification will be shown (updates cooldown timestamp)
  // This must happen IMMEDIATELY after cooldown check to prevent race conditions
  // If variant turns out to be deactivated, we'll decrement the monthly counter below
  recordNotificationShown(context, notificationEvent);

  // Fetch notification
  let notificationData: ExtensionNotificationResponse | null = null;
  try {
    notificationData = await fetchNotificationData(notificationEvent, version);
  } catch (error) {
    console.error('Failed to fetch notification data:', error);

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
      [NotificationEvent.EXTENSION_THREE_DAY_STREAK]: {
        message:
          "🔥 3-day streak! You're hooked. Ever wonder what power users unlock with Pro?",
        ctaText: 'Discover More',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_MULTI_FILE_LOGS]: {
        message:
          "📂 Logs in 3+ files already? See them all in one place with Pro's central panel.",
        ctaText: 'Learn More',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/insert-log-message`,
      },
      [NotificationEvent.EXTENSION_TEN_INSERTS]: {
        message:
          '🎓 10 logs already! Did you know you can comment or delete them all at once?',
        ctaText: 'Discover Features',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/comment-inserted-log-messages`,
      },
      [NotificationEvent.EXTENSION_TWENTY_INSERTS]: {
        message:
          '🎉 20 logs and counting! Join our newsletter to stay updated with tips, tricks, and new features.',
        ctaText: 'Join Community',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/join`,
      },
      [NotificationEvent.EXTENSION_FIFTY_INSERTS]: {
        message:
          '💪 50 logs! Most users unlock the central log panel at this point. Curious why?',
        ctaText: 'Show Me',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/pro`,
      },
      [NotificationEvent.EXTENSION_HUNDRED_INSERTS]: {
        message:
          "🚀 100 logs! You're a power user. Unlock Pro to manage them all from one central panel.",
        ctaText: 'Explore Pro',
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
      [NotificationEvent.EXTENSION_INACTIVE_MANUAL_LOG]: {
        message:
          '💡 Still typing console.log()? Save time with Turbo! Insert logs 10x faster.',
        ctaText: 'See How',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/documentation/features/insert-log-message`,
      },
      [NotificationEvent.EXTENSION_RELEASE_ANNOUNCEMENT]: {
        message: 'Cheers to 2025 wins & exciting 2026 possibilities! 🥳',
        ctaText: 'Cheers!',
        ctaUrl: `${TURBO_WEBSITE_BASE_URL}/articles/release-3130`,
      },
    };

    const fallback = fallbackMessages[notificationEvent];
    notificationData = {
      ...fallback,
      variant: 'fallback',
      isDeactivated: false,
    };
  }

  if (notificationData.isDeactivated) {
    // Variant is deactivated, don't show notification
    // Undo the notification recording to free up both timestamp and counter
    undoNotificationRecording(context, notificationEvent);
    return false;
  }

  const telemetryService = createTelemetryService();
  telemetryService
    .reportNotificationInteraction(
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

      // Reset dismissal counter on CTA click
      resetDismissalCounter(context);

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
      // Reset dismissal counter since user took action
      resetDismissalCounter(context);
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

      // Record dismissal (increments counter and may pause notifications)
      recordDismissal(context);
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

      // Record dismissal (increments counter and may pause notifications)
      recordDismissal(context);
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}
