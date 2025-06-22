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

const setProBundleRemovalReasonMock = jest.fn();
jest.mock('../../pro', () => {
  return {
    TurboProFreemiumTreeProvider: jest.fn().mockImplementation(() => ({})),
    TurboProShowcasePanel: class {
      static viewType = 'mocked.panel.showCasePanel';
    },
    TurboProBundleRepairPanel: class {
      static viewType = 'mocked.panel.proBundleRepairPanel';
      setProBundleRemovalReason = setProBundleRemovalReasonMock;
    },
  };
});

jest.mock('../../pro/utilities', () => ({
  runProBundle: jest.fn(),
  updateProBundle: jest.fn(),
  proBundleNeedsUpdate: jest.fn(),
}));

describe.only('activate - command registration', () => {
  const registerCommandMock = jest.fn();
  const executeCommandMock = jest.fn();
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
      .spyOn(vscode.commands, 'executeCommand')
      .mockImplementation(executeCommandMock);
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
  it('falls back to repair mode if updateProBundle throws', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate Pro state
    (helpers.readFromGlobalState as jest.Mock).mockImplementation(
      (_context, key: string) => {
        if (key === 'license-key') return 'LICENSE123';
        if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
        if (key === 'version') return '2.0.0';
        return undefined;
      },
    );

    // Set up release metadata
    const releaseNote: { webViewHtml: string; isPro: boolean } = {
      webViewHtml: '<html></html>',
      isPro: true,
    };
    (releases.releaseNotes as Record<string, typeof releaseNote>)['3.0.0'] =
      releaseNote;

    // Mock version
    jest.spyOn(vscode.extensions, 'getExtension').mockReturnValue({
      packageJSON: { version: '3.0.0' },
    } as vscode.Extension<never>);

    // Confirming the update
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(true);

    // Force update failure
    const errorMessage = 'Update failed due to some reason';
    (proUtilities.updateProBundle as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    // Mock activateRepairMode
    (helpers.activateRepairMode as jest.Mock).mockImplementation(() => {});

    await activate(fakeContext);

    // Assertion zone

    expect(proUtilities.updateProBundle).toHaveBeenCalledWith(
      fakeContext,
      '3.0.0',
      'LICENSE123',
      expect.anything(), // ExtensionProperties
    );
    expect(helpers.activateRepairMode).toHaveBeenCalled();

    expect(setProBundleRemovalReasonMock).toHaveBeenCalledWith(errorMessage);

    expect(registerCommandMock).toHaveBeenCalledWith(
      'turboConsoleLog.retryProUpdate',
      expect.any(Function),
    );
  });
  it('executes retryProUpdate and calls updateProBundle again', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate Pro state
    (helpers.readFromGlobalState as jest.Mock).mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      if (key === 'version') return '2.0.0';
      return undefined;
    });

    // Mock release notes
    (
      releases.releaseNotes as Record<
        string,
        { webViewHtml: string; isPro: boolean }
      >
    )['3.0.0'] = {
      webViewHtml: '<html></html>',
      isPro: true,
    };

    // Mock version
    jest.spyOn(vscode.extensions, 'getExtension').mockReturnValue({
      packageJSON: { version: '3.0.0' },
    } as vscode.Extension<never>);

    // Simulate update failure during activation
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(true);
    const firstCall = jest.fn().mockRejectedValue(new Error('initial fail'));
    const secondCall = jest.fn().mockResolvedValue(undefined);
    (proUtilities.updateProBundle as jest.Mock)
      .mockImplementationOnce(firstCall)
      .mockImplementationOnce(secondCall);

    // Ensure repair mode and side effects are mocked
    (helpers.activateRepairMode as jest.Mock).mockImplementation(() => {});

    await activate(fakeContext);

    // 🧠 Lookup the registered retry command
    const retryCall = registerCommandMock.mock.calls.find(
      ([name]) => name === 'turboConsoleLog.retryProUpdate',
    );
    expect(retryCall).toBeDefined();

    // 💥 Call the handler manually to simulate retry
    const retryHandler = retryCall?.[1];
    await retryHandler();

    // ✅ updateProBundle called again on retry
    expect(secondCall).toHaveBeenCalledWith(
      fakeContext,
      '3.0.0',
      'LICENSE123',
      expect.anything(),
    );
  });
  it('activates freemium mode when no license or bundle are found', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate freemium state
    (helpers.readFromGlobalState as jest.Mock).mockReturnValue(undefined);

    await activate(fakeContext);

    expect(helpers.activateFreemiumMode).toHaveBeenCalledTimes(1);
    expect(proUtilities.runProBundle).not.toHaveBeenCalled();
    expect(proUtilities.updateProBundle).not.toHaveBeenCalled();
  });
});
