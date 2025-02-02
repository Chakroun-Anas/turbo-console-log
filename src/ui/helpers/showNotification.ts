import * as vscode from 'vscode';

export function showNotification(message: string, duration: number): void {
  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification },
    async (progress) => {
      const steps = 100;
      const delay = duration / steps;

      for (let i = 0; i <= steps; i++) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            progress.report({ increment: 1, message: message });
            resolve();
          }, delay);
        });
      }
    },
  );
}
