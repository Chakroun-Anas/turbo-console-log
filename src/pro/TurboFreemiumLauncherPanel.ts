import * as vscode from 'vscode';

export class TurboFreemiumLauncherPanel
  implements vscode.TreeDataProvider<string>
{
  public static readonly viewType = 'turboConsoleLogFreemiumLauncher';
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(): vscode.TreeItem {
    const item = new vscode.TreeItem('Loading…');
    item.iconPath = new vscode.ThemeIcon('rocket');
    return item;
  }

  getChildren(): string[] {
    return ['open'];
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}
