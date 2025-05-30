import * as vscode from 'vscode';

export class TurboProFreemiumTreeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    const announcement = new vscode.TreeItem(
      'Turbo Pro is live for Early Adopters!',
    );
    announcement.iconPath = new vscode.ThemeIcon('megaphone');
    announcement.tooltip =
      'Turbo Console Log Pro is now available for early adopters!';
    announcement.command = {
      command: 'vscode.open',
      title: 'Read Release Notes',
      arguments: [
        vscode.Uri.parse(
          'https://www.turboconsolelog.io/articles/release-2180',
        ),
      ],
    };

    const activateItem = new vscode.TreeItem(
      'Got a key? → Activate Your PRO Bundle!',
    );
    activateItem.iconPath = new vscode.ThemeIcon('key');
    activateItem.tooltip =
      'Activate your PRO license key at turboconsolelog.io/pro';
    activateItem.command = {
      command: 'vscode.open',
      title: 'Activate PRO Bundle!',
      arguments: [vscode.Uri.parse('https://www.turboconsolelog.io/pro')],
    };

    const joinItem = new vscode.TreeItem('Missed it? Subscribe for updates!');
    joinItem.iconPath = new vscode.ThemeIcon('mail');
    joinItem.tooltip =
      'Join the newsletter and get notified when Pro launches publicly';
    joinItem.command = {
      command: 'vscode.open',
      title: 'Join Newsletter',
      arguments: [vscode.Uri.parse('https://www.turboconsolelog.io/join')],
    };

    items.push(announcement, activateItem, joinItem);
    return items;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
