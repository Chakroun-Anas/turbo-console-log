import * as vscode from 'vscode';
import { TURBO_CAMPAIGN } from '@/pro/campaign';

// Per-second ticking so minutes and seconds visibly count down, not just
// days/hours — this is the only host-side timer in the extension.
const COUNTDOWN_UPDATE_INTERVAL_MS = 1000;

function formatRemaining(msRemaining: number): string {
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// campaignActive is computed once at activation (Date.now() < countdownTarget
// at that moment). While true, a lightweight interval keeps the countdown
// ticking live and self-reverts to the plain text the moment countdownTarget
// passes — no reload needed. The interval is disposed alongside the item.
export function createReleasePanelStatusBarItem(
  version: string,
  campaignActive: boolean,
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10,
  );
  item.command = 'turboConsoleLog.showReleasePanel';

  const plainText = `$(rocket) Turbo v${version}`;
  const plainTooltip = `What's New in Turbo Console Log v${version}`;

  if (!campaignActive) {
    item.text = plainText;
    item.tooltip = plainTooltip;
    item.show();
    return item;
  }

  const promoTooltip = `What's New in Turbo Console Log v${version} — ${TURBO_CAMPAIGN.percentage}% off Turbo Pro this week`;

  let interval: ReturnType<typeof setInterval> | undefined;

  const update = () => {
    const remaining = TURBO_CAMPAIGN.countdownTarget.getTime() - Date.now();
    if (remaining <= 0) {
      item.text = plainText;
      item.tooltip = plainTooltip;
      if (interval) clearInterval(interval);
      return;
    }
    item.text = `$(rocket) Turbo v${version} — ${TURBO_CAMPAIGN.percentage}% off · ${formatRemaining(remaining)}`;
    item.tooltip = promoTooltip;
  };

  update();
  if (TURBO_CAMPAIGN.countdownTarget.getTime() > Date.now()) {
    interval = setInterval(update, COUNTDOWN_UPDATE_INTERVAL_MS);
  }

  const originalDispose = item.dispose.bind(item);
  item.dispose = () => {
    if (interval) clearInterval(interval);
    originalDispose();
  };

  item.show();
  return item;
}
