import * as vscode from 'vscode';
import { activate } from '../../extension';
import * as commandsModule from '../../commands';
import * as helpers from '../../helpers';
import * as releases from '../../releases';
import * as uiHelpers from '../../ui/helpers';
import * as proUtilities from '../../pro/utilities';
import { ExtensionProperties } from '../../entities';

jest.mock('../../helpers');
jest.mock('../../releases');
jest.mock('../../ui/helpers');

jest.mock('../../pro', () => {
  return {
    TurboProFreemiumTreeProvider: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('../../pro/utilities', () => ({
  runProBundle: jest.fn(),
  updateProBundle: jest.fn(),
  proBundleNeedsUpdate: jest.fn(),
}));

describe.only('activate - command registration', () => {
  const registerCommandMock = jest.fn();
  const getConfigurationMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock extension properties
    jest
      .spyOn(helpers, 'getExtensionProperties')
      .mockReturnValue({} as ExtensionProperties);

    // Mock commands
    jest.spyOn(commandsModule, 'getAllCommands').mockReturnValue([
      { name: 'turbo.sayHello', handler: jest.fn() },
      { name: 'turbo.doSomething', handler: jest.fn() },
    ]);

    // Mock vscode window registerTreeDataProvider
    const mockedRegisterTreeDataProvider = jest.fn(() => ({
      dispose: jest.fn(),
    }));
    Object.defineProperty(vscode, 'window', {
      value: {
        ...vscode.window,
        registerTreeDataProvider: mockedRegisterTreeDataProvider,
      },
    });

    // Mock VSCode API
    jest
      .spyOn(vscode.commands, 'registerCommand')
      .mockImplementation(registerCommandMock);
    jest
      .spyOn(vscode.workspace, 'getConfiguration')
      .mockImplementation(getConfigurationMock);
    jest.spyOn(vscode.extensions, 'getExtension').mockImplementation(() => ({
      id: 'ChakrounAnas.turbo-console-log',
      extensionUri: {} as vscode.Uri,
      extensionKind: 1,
      extensionPath: '',
      isActive: true,
      exports: {},
      activate: jest.fn(),
      packageJSON: {
        version: '3.0.0',
      },
    }));

    // Safe mocks for release version helpers
    (releases.getPreviousWebViewReleaseVersion as jest.Mock).mockReturnValue(
      '2.16.0',
    );
    (releases.getLatestWebViewReleaseVersion as jest.Mock).mockReturnValue(
      '3.0.0',
    );
    (
      uiHelpers.showReleaseHtmlWebViewAndNotification as jest.Mock
    ).mockImplementation(() => {});
    (helpers.readFromGlobalState as jest.Mock).mockReturnValue(undefined);
  });

  it('registers all commands returned by getAllCommands', () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    activate(fakeContext);

    expect(registerCommandMock).toHaveBeenCalledTimes(2);
    expect(registerCommandMock).toHaveBeenCalledWith(
      'turbo.sayHello',
      expect.any(Function),
    );
    expect(registerCommandMock).toHaveBeenCalledWith(
      'turbo.doSomething',
      expect.any(Function),
    );
  });
  it('Invoke showing the release webview with correct versions', () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    activate(fakeContext);

    expect(
      uiHelpers.showReleaseHtmlWebViewAndNotification,
    ).toHaveBeenCalledWith(fakeContext, '2.16.0', '3.0.0');
  });
  it('calls updateProBundle if pro is active and update is needed', () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Setup mocks
    (helpers.readFromGlobalState as jest.Mock).mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      if (key === 'version') return '2.0.0';
      return undefined;
    });

    (
      releases.releaseNotes as Record<
        string,
        { webViewHtml: string; isPro: boolean }
      >
    )['3.0.0'] = { isPro: true, webViewHtml: '<html></html>' };
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(true);

    activate(fakeContext);

    expect(proUtilities.updateProBundle).toHaveBeenCalledWith(
      fakeContext,
      '3.0.0',
      'LICENSE123',
      expect.anything(), // extensionProperties
    );
    expect(proUtilities.runProBundle).not.toHaveBeenCalled();
  });
  it('calls runProBundle if pro is active and bundle is up-to-date', () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    (helpers.readFromGlobalState as jest.Mock).mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      if (key === 'version') return '3.0.0';
      return undefined;
    });

    (
      releases.releaseNotes as Record<
        string,
        { webViewHtml: string; isPro: boolean }
      >
    )['3.0.0'] = { isPro: true, webViewHtml: '<html></html>' };

    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(false);

    activate(fakeContext);

    expect(proUtilities.runProBundle).toHaveBeenCalledWith(
      expect.any(Object), // extensionProperties
      'PRO_BUNDLE_CODE',
    );

    expect(proUtilities.updateProBundle).not.toHaveBeenCalled();
  });
});
