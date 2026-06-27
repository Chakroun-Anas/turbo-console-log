import * as vscode from 'vscode';

export class TurboReleaseLauncherPanel implements vscode.TreeDataProvider<string> {
  public static readonly viewType = 'turboConsoleLogReleasePanelLauncher';
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly version: string) {}

  getTreeItem(): vscode.TreeItem {
    const item = new vscode.TreeItem(`What's New in v${this.version}`);
    item.iconPath = new vscode.ThemeIcon('rocket');
    return item;
  }

  getChildren(): string[] {
    return ['open'];
  }
}
