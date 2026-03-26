import * as vscode from 'vscode';
import { isTestMode } from '@/runTime';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

/**
 * Trial status for status bar display
 */
export type TrialStatus = 'never-tried' | 'active' | 'expired';

/**
 * Manages countdown timer for active trials
 * Shows remaining time and handles expiration
 */
export class TrialCountdownTimer {
  private statusBarItem: vscode.StatusBarItem;
  private timer: NodeJS.Timeout | undefined;
  private expiresAt: Date;
  private onExpiredCallback: (() => void) | undefined;
  private context: vscode.ExtensionContext;
  private version: string;

  constructor(
    expiresAt: Date,
    context: vscode.ExtensionContext,
    version: string,
    onExpired?: () => void,
  ) {
    this.expiresAt = expiresAt;
    this.context = context;
    this.version = version;
    this.onExpiredCallback = onExpired;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100,
    );
  }

  /**
   * Start the countdown timer
   * Updates every minute
   */
  public start(): void {
    // Show immediately
    this.updateDisplay();
    this.statusBarItem.show();

    // Update every minute (60 seconds)
    this.timer = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  /**
   * Update the countdown display
   */
  private updateDisplay(): void {
    const now = new Date();
    const remaining = this.expiresAt.getTime() - now.getTime();

    if (remaining <= 0) {
      // Trial expired - trigger callback
      this.handleExpiration();
      return;
    }

    // Calculate hours, minutes, and seconds remaining
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Update status bar text with seconds for urgency
    if (hours > 0) {
      this.statusBarItem.text = `$(clock) Pro Trial: ${hours}h ${minutes}m ${seconds}s`;
    } else {
      this.statusBarItem.text = `$(clock) Pro Trial: ${minutes}m ${seconds}s`;
    }

    // Warning (orange) background during trial
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground',
    );

    // Build trial page URL with countdown query param and tracking
    const trialUrl = `${TURBO_WEBSITE_BASE_URL}/pro-trial?timeLeft=${hours}h${minutes}m${seconds}s&event=trial-workflow&variant=status-bar-countdown`;
    this.statusBarItem.command = {
      title: 'View Trial Status',
      command: 'vscode.open',
      arguments: [vscode.Uri.parse(trialUrl)],
    };

    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes <= 30) {
      this.statusBarItem.tooltip = `Trial expires soon! ${hours}h ${minutes}m ${seconds}s remaining. Click to see details.`;
    } else {
      this.statusBarItem.tooltip = `Pro trial expires in ${hours}h ${minutes}m ${seconds}s. Click to see details.`;
    }
  }

  /**
   * Handle trial expiration
   */
  private handleExpiration(): void {
    console.log('[Trial] Trial has expired via countdown');

    // Stop the timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    // Hide the countdown status bar
    this.statusBarItem.hide();

    // Trigger callback to clean up trial metadata and switch to freemium
    if (this.onExpiredCallback) {
      this.onExpiredCallback();
    }

    // Show upgrade prompt using official notification system
    // (has built-in fallback mechanism if backend fetch fails)
    showNotification(
      NotificationEvent.EXTENSION_TRIAL_EXPIRED,
      this.version,
      this.context,
    );
  }

  /**
   * Stop the timer and clean up resources
   */
  public dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.statusBarItem.dispose();
  }

  /**
   * Check if trial has expired
   */
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

/**
 * Creates a simple status bar for trial invitation (never-tried users)
 */
export function createTrialInvitationStatusBar(): vscode.StatusBarItem {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = 'Try Turbo Pro For Free $(rocket)';
  statusBarItem.tooltip = 'Start your free trial of Turbo Console Log Pro!';
  statusBarItem.command = {
    title: 'Start Pro Trial',
    command: 'vscode.open',
    arguments: [
      vscode.Uri.parse(
        `${TURBO_WEBSITE_BASE_URL}/pro-trial?event=trial-workflow&variant=status-bar-invitation`,
      ),
    ],
  };
  return statusBarItem;
}

/**
 * Creates a simple status bar for expired trial warning
 */
export function createTrialExpiredStatusBar(): vscode.StatusBarItem {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = '$(warning) Pro Trial Ended';
  statusBarItem.backgroundColor = new vscode.ThemeColor(
    'statusBarItem.errorBackground',
  );
  statusBarItem.tooltip = 'Your trial has expired. Click to upgrade to Pro!';
  statusBarItem.command = {
    title: 'Upgrade to Pro',
    command: 'vscode.open',
    arguments: [
      vscode.Uri.parse(
        `${TURBO_WEBSITE_BASE_URL}/pro?fromExpiredTrial=true&event=trial-workflow&variant=status-bar-expired`,
      ),
    ],
  };
  return statusBarItem;
}
