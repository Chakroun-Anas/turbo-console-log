import * as vscode from 'vscode';

export function openWebView(title: string, htmlContent: string) {
  const panel = vscode.window.createWebviewPanel(
    'turboConsoleLogUpdates',
    title,
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = htmlContent;
}
