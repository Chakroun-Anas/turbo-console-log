import * as vscode from 'vscode';
import { readFromGlobalState } from '@/helpers';
import { ExtensionProperties } from '@/entities';
import { showFreshInstallWebView } from './showFreshInstallWebView';
import { showLatestReleaseWebView } from './showLatestReleaseWebView';
import { isCurrentTimeWithinReleaseReviewWindow } from './isCurrentTimeWithinReleaseReviewWindow';
import { targetWindowDate } from './targetWindowDate';
import { isReleasePastSevenDays } from './isReleasePastSevenDays';
import { additionalTargetWindow } from './additionalTargetWindow';

export function showReleaseHtmlWebView(
  context: vscode.ExtensionContext,
  previousWebViewReleaseVersion: string,
  latestWebViewReleaseVersion: string,
  releaseReviewTargetWindow: ExtensionProperties['releaseReviewTargetWindow'],
  currentDate: Date,
  releaseDate?: Date,
): void {
  const wasPreviousReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${previousWebViewReleaseVersion}`,
  );
  const wasLatestReleaseWebviewShown = readFromGlobalState(
    context,
    `IS_NOTIFICATION_SHOWN_${latestWebViewReleaseVersion}`,
  );
  // Fresh install of the extension
  if (!wasPreviousReleaseWebviewShown && !wasLatestReleaseWebviewShown) {
    showFreshInstallWebView(context, latestWebViewReleaseVersion);
    return;
  }
  // Existing users updating the extension
  if (!wasLatestReleaseWebviewShown) {
    if (isCurrentTimeWithinReleaseReviewWindow(releaseReviewTargetWindow)) {
      showLatestReleaseWebView(context, latestWebViewReleaseVersion);
      return;
    }
    const pastSevenDaysOfRelease = isReleasePastSevenDays(
      releaseDate ?? new Date(),
      currentDate,
    );

    if (pastSevenDaysOfRelease) {
      // After 7 days, try showing in the next available window
      const nextTargetWindow = additionalTargetWindow(
        releaseReviewTargetWindow,
      );

      // If we're currently in the next target window, show immediately
      if (
        isCurrentTimeWithinReleaseReviewWindow(nextTargetWindow, currentDate)
      ) {
        showLatestReleaseWebView(context, latestWebViewReleaseVersion);
        return;
      }

      // Otherwise, schedule for whichever window comes sooner
      const originalTargetDate = targetWindowDate(
        releaseReviewTargetWindow,
        currentDate,
      );
      const additionalTargetDate = targetWindowDate(
        nextTargetWindow,
        currentDate,
      );

      // Pick the sooner of the two windows
      const earliestTargetDate =
        originalTargetDate.getTime() < additionalTargetDate.getTime()
          ? originalTargetDate
          : additionalTargetDate;

      const webViewDeltaTime =
        earliestTargetDate.getTime() - currentDate.getTime();

      if (webViewDeltaTime > 0) {
        const timeoutId = setTimeout(() => {
          showLatestReleaseWebView(context, latestWebViewReleaseVersion);
        }, webViewDeltaTime);

        context.subscriptions.push({
          dispose: () => clearTimeout(timeoutId),
        });
      }
      return;
    }
    // If not within the target window, schedule the notification for the next window
    const targetDate = targetWindowDate(releaseReviewTargetWindow);

    const webViewDeltaTime = targetDate.getTime() - currentDate.getTime();
    if (webViewDeltaTime > 0) {
      const timeoutId = setTimeout(() => {
        showLatestReleaseWebView(context, latestWebViewReleaseVersion);
      }, targetDate.getTime() - currentDate.getTime());
      context.subscriptions.push({
        dispose: () => {
          return clearTimeout(timeoutId);
        },
      });
    }
  }
}
