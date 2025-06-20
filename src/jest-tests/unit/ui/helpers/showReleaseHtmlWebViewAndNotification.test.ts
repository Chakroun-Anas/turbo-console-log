import * as vscode from 'vscode';
import { showReleaseHtmlWebViewAndNotification } from '../../../../ui/helpers/showReleaseHtmlWebViewAndNotification';
import * as openWebViewModule from '../../../../ui/helpers/openWebView';
import * as helpers from '../../../../helpers';
import * as freshInstall from '../../../../releases/fresh-install';

jest.mock('../../../../helpers');
jest.mock('../../../../ui/helpers/openWebView');
jest.mock('../../../../releases/fresh-install');

describe.only('showReleaseHtmlWebViewAndNotification', () => {
  const readMock = helpers.readFromGlobalState as jest.Mock;
  const writeMock = helpers.writeToGlobalState as jest.Mock;
  const openWebViewMock = openWebViewModule.openWebView as jest.Mock;
  const freshInstallHtmlMock = freshInstall.getHtmlWebView as jest.Mock;

  const context = {} as vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(vscode, 'ViewColumn', {
      value: { One: 1 },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(vscode.window, 'createWebviewPanel', {
      value: jest.fn(() => ({
        webview: { html: '' },
        reveal: jest.fn(),
      })),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    delete (
      vscode as Omit<typeof vscode, 'ViewColumn'> & { ViewColumn?: unknown }
    ).ViewColumn;
    delete (
      vscode.window as Omit<typeof vscode.window, 'createWebviewPanel'> & {
        createWebviewPanel?: unknown;
      }
    ).createWebviewPanel;
  });

  it('shows fresh install webview if neither version was seen', () => {
    readMock.mockReturnValue(undefined);
    freshInstallHtmlMock.mockReturnValue('<html>Fresh</html>');

    showReleaseHtmlWebViewAndNotification(context, '2.16.0', '3.0.0');

    expect(openWebViewMock).toHaveBeenCalledWith(
      `🚀 Welcome To Turbo Console Log Family 🎊`,
      '<html>Fresh</html>',
    );
    expect(writeMock).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_3.0.0',
      true,
    );
  });

  it('shows release notes webview if previous version was seen but latest was not', () => {
    readMock.mockImplementation((_, key) => {
      if (key === 'IS_NOTIFICATION_SHOWN_2.16.0') return true;
      if (key === 'IS_NOTIFICATION_SHOWN_3.0.0') return undefined;
    });

    const releaseHtml = '<html>3.0.0 release notes</html>';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const releaseNotesModule = require('../../../../releases');
    releaseNotesModule.releaseNotes['3.0.0'] = { webViewHtml: releaseHtml };

    showReleaseHtmlWebViewAndNotification(context, '2.16.0', '3.0.0');

    expect(openWebViewMock).toHaveBeenCalledWith(
      '🚀 Turbo Console Log - Release 3.0.0 Notes',
      releaseHtml,
    );
    expect(writeMock).toHaveBeenCalledWith(
      context,
      'IS_NOTIFICATION_SHOWN_3.0.0',
      true,
    );
  });
  it('does nothing if both previous and latest webviews were already shown', () => {
    readMock.mockReturnValue(true); // All `readFromGlobalState` calls return true

    showReleaseHtmlWebViewAndNotification(context, '2.16.0', '3.0.0');

    expect(openWebViewMock).not.toHaveBeenCalled();
    expect(writeMock).not.toHaveBeenCalled();
  });
});
