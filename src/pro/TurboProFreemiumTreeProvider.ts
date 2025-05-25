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

    const announcement = new vscode.TreeItem('🎉 Turbo Pro is now live!');
    announcement.iconPath = new vscode.ThemeIcon('megaphone');
    announcement.tooltip = 'Announcing the early access release of Turbo Pro';
    announcement.command = {
      command: 'vscode.open',
      title: 'Pro Release Article',
      arguments: [
        vscode.Uri.parse(
          'https://www.turboconsolelog.io/articles/release-2170',
        ),
      ],
    };

    const activateItem = new vscode.TreeItem(
      '🚀 Early Adopters → Activate PRO Bundle',
    );
    activateItem.command = {
      command: 'vscode.open',
      title: 'Activate PRO',
      arguments: [vscode.Uri.parse('https://www.turboconsolelog.io/pro')],
    };
    activateItem.iconPath = new vscode.ThemeIcon('key');
    activateItem.tooltip =
      'Go to turboconsolelog.io/pro to activate your license';

    const newsletterItem = new vscode.TreeItem(
      '📬 Not invited? Join the newsletter!',
    );
    newsletterItem.command = {
      command: 'vscode.open',
      title: 'Join Newsletter',
      arguments: [vscode.Uri.parse('https://www.turboconsolelog.io/join')],
    };
    newsletterItem.iconPath = new vscode.ThemeIcon('mail');
    newsletterItem.tooltip = 'Stay tuned for the public release next week';

    items.push(announcement, activateItem, newsletterItem);
    return items;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
