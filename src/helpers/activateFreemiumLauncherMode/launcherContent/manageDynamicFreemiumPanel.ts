import * as vscode from 'vscode';
import axios from 'axios';
import { readFromGlobalState } from '../../readFromGlobalState';
import { writeToGlobalState } from '../../writeToGlobalState';
import { GlobalStateKeys } from '../../GlobalStateKeys';
import { shouldShowBadge } from './shouldShowBadge';

// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';
const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';

/**
 * Manages dynamic freemium panel content including caching, API fetching, and badge updates
 * Handles 24-hour cache, user access tracking, and intelligent badge display logic
 * @param context VS Code extension context for global storage
 * @param launcherView Tree view instance to update badge
 */
export async function manageDynamicFreemiumPanel(
  context: vscode.ExtensionContext,
  launcherView: vscode.TreeView<string> | undefined,
): Promise<void> {
  try {
    // Check if dynamic freemium panel setting is enabled
    const config = vscode.workspace.getConfiguration('turboConsoleLog');
    const isDynamicFreemiumPanelEnabled = config.get<boolean>(
      'dynamicFreemiumPanel',
      true,
    );

    // If disabled, do nothing
    if (!isDynamicFreemiumPanelEnabled) {
      return;
    }

    // Check if we've fetched content recently (24-hour cache)
    const lastFetchDate = readFromGlobalState(
      context,
      GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_FETCH,
    ) as string | undefined;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // If we have a recent fetch (within 24 hours), skip the API call
    if (lastFetchDate) {
      const lastFetch = new Date(lastFetchDate);
      if (lastFetch > twentyFourHoursAgo) {
        console.info(
          'Dynamic freemium content cache still valid, skipping API call. Last fetch:',
          lastFetch,
        );

        // Check if user has already seen the current content
        const existingContent = readFromGlobalState(
          context,
          GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
        ) as { date?: string; tooltip?: string } | undefined;

        const lastPanelAccess = readFromGlobalState(
          context,
          GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_ACCESS,
        ) as string | undefined;

        // Only show badge if content exists with valid date and user hasn't seen it yet
        if (
          existingContent &&
          existingContent.date &&
          launcherView &&
          shouldShowBadge(existingContent.date, lastPanelAccess)
        ) {
          launcherView.badge = {
            value: 1,
            tooltip: existingContent.tooltip || 'New content in Turbo panel',
          };
        }
        return;
      }
    }

    // Fetch dynamic content from the API endpoint (cache expired or first time)
    console.info('Fetching dynamic freemium content from API...');
    const response = await axios.get(
      `${TURBO_WEBSITE_BASE_URL}/api/dynamicFreemiumPanel`,
      {
        timeout: 10000, // 10 second timeout
      },
    );

    if (response.data && launcherView) {
      // Get previously stored content to compare dates
      const previousContent = readFromGlobalState(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
      ) as { date?: string } | undefined;

      // Check if content has changed by comparing dates
      const newContentDate = new Date(response.data.date).getTime();
      const previousContentDate = previousContent?.date
        ? new Date(previousContent.date).getTime()
        : 0;

      // Only update storage if content has actually changed
      if (newContentDate !== previousContentDate) {
        // Store the API response in global storage for TurboProShowcasePanel to use
        writeToGlobalState(
          context,
          GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_CONTENT,
          response.data,
        );

        console.info(
          'Dynamic freemium content updated with new date:',
          new Date(newContentDate),
        );

        // For genuinely new content, always show badge regardless of last access
        launcherView.badge = {
          value: 1,
          tooltip: response.data.tooltip || 'New content in Turbo panel',
        };
      } else {
        console.info(
          'Dynamic freemium content unchanged, badge state preserved from previous cycles',
        );
      }

      // Always update the last fetch date after successful API call
      writeToGlobalState(
        context,
        GlobalStateKeys.DYNAMIC_FREEMIUM_PANEL_LAST_FETCH,
        now.toISOString(),
      );
    }
  } catch (error) {
    // Silently fail if the API is not available or request fails
    // Keep the original badge with value 0
    console.error('Failed to fetch dynamic freemium content:', error);
  }
}
