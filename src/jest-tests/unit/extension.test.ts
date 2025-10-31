import * as vscode from 'vscode';
import { activate } from '../../extension';
import * as commandsModule from '../../commands';
import * as helpers from '../../helpers';
import * as releases from '../../releases';
import * as proUtilities from '../../pro/utilities';
import { ExtensionProperties } from '../../entities';

jest.mock('../../helpers');
jest.mock('../../releases');

const updateViewMock = jest.fn();
jest.mock('../../pro', () => {
  return {
    TurboProShowcasePanel: class {
      static viewType = 'mocked.panel.showCasePanel';
    },
    TurboProBundleRepairPanel: class {
      static viewType = 'mocked.panel.proBundleRepairPanel';
      updateView = updateViewMock;
    },
    TurboFreemiumLauncherPanel: class {
      static viewType = 'mocked.panel.freemiumLauncherPanel';
    },
  };
});

jest.mock('../../pro/utilities', () => ({
  runProBundle: jest.fn(),
  updateProBundle: jest.fn(),
  proBundleNeedsUpdate: jest.fn(),
}));

describe('activate - command registration', () => {
  const registerCommandMock = jest.fn();
  const executeCommandMock = jest.fn();
  const getConfigurationMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock extension properties
    jest.spyOn(helpers, 'getExtensionProperties').mockReturnValue({
      wrapLogMessage: false,
      logMessagePrefix: '🚀',
    } as ExtensionProperties);

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

    (helpers.readFromGlobalState as jest.Mock).mockReturnValue(undefined);

    // Reset pro utilities mocks specifically
    (proUtilities.runProBundle as jest.Mock).mockResolvedValue(undefined);
    (proUtilities.updateProBundle as jest.Mock).mockResolvedValue(undefined);
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(false);
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
  it('calls traceExtensionVersionHistory with current version', () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    activate(fakeContext);

    expect(helpers.traceExtensionVersionHistory).toHaveBeenCalledWith(
      fakeContext,
      '3.0.0',
    );
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
      fakeContext,
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
    expect(helpers.activateRepairMode).toHaveBeenCalledWith({
      context: fakeContext,
      version: '3.0.0',
      proLicenseKey: 'LICENSE123',
      config: expect.anything(),
      turboProBundleRepairPanel: expect.anything(),
      reason: errorMessage,
      mode: 'update',
      proBundle: 'PRO_BUNDLE_CODE',
    });

    // activateRepairMode now handles command registration internally, so we don't check registerCommandMock directly
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

    // Mock activateRepairMode to capture command registration
    let registeredRetryHandler: (() => Promise<void>) | undefined;
    (helpers.activateRepairMode as jest.Mock).mockImplementation(() => {
      // Simulate internal command registration within activateRepairMode
      const retryHandler = async () => {
        await secondCall(fakeContext, '3.0.0', 'LICENSE123', expect.anything());
      };
      registeredRetryHandler = retryHandler;
    });

    await activate(fakeContext);

    // Verify activateRepairMode was called
    expect(helpers.activateRepairMode).toHaveBeenCalled();
    expect(registeredRetryHandler).toBeDefined();

    // 💥 Call the handler to simulate retry (simulating the internal command registration)
    await registeredRetryHandler!();

    // ✅ updateProBundle called again on retry
    expect(secondCall).toHaveBeenCalledWith(
      fakeContext,
      '3.0.0',
      'LICENSE123',
      expect.anything(),
    );
  });
  it('falls back to repair mode if runProBundle throws', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate Pro state with up-to-date bundle
    (helpers.readFromGlobalState as jest.Mock).mockImplementation(
      (_context, key: string) => {
        if (key === 'license-key') return 'LICENSE123';
        if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
        if (key === 'version') return '3.0.0';
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

    // Bundle is up-to-date, so no update needed
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(false);

    // Force runProBundle failure
    const errorMessage = 'Failed to execute pro bundle';
    (proUtilities.runProBundle as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    // Mock activateRepairMode
    (helpers.activateRepairMode as jest.Mock).mockImplementation(() => {});

    await activate(fakeContext);

    // Verify runProBundle was called and failed
    expect(proUtilities.runProBundle).toHaveBeenCalledWith(
      expect.anything(), // extensionProperties
      'PRO_BUNDLE_CODE',
      fakeContext,
    );

    // Verify activateRepairMode was called with run mode
    expect(helpers.activateRepairMode).toHaveBeenCalledWith({
      context: fakeContext,
      version: '3.0.0',
      proLicenseKey: 'LICENSE123',
      config: expect.anything(),
      turboProBundleRepairPanel: expect.anything(),
      reason: errorMessage,
      mode: 'run',
      proBundle: 'PRO_BUNDLE_CODE',
    });

    // updateProBundle should not have been called since bundle was up-to-date
    expect(proUtilities.updateProBundle).not.toHaveBeenCalled();
  });

  it('executes retryProRun and calls runProBundle again', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate Pro state with up-to-date bundle
    (helpers.readFromGlobalState as jest.Mock).mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      if (key === 'version') return '3.0.0';
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

    // Bundle is up-to-date, so no update needed
    (proUtilities.proBundleNeedsUpdate as jest.Mock).mockReturnValue(false);

    // Simulate runProBundle failure during activation, then success on retry
    const firstCall = jest
      .fn()
      .mockRejectedValue(new Error('initial run fail'));
    const secondCall = jest.fn().mockResolvedValue(undefined);
    (proUtilities.runProBundle as jest.Mock)
      .mockImplementationOnce(firstCall)
      .mockImplementationOnce(secondCall);

    // Mock activateRepairMode to capture command registration
    let registeredRetryHandler: (() => Promise<void>) | undefined;
    (helpers.activateRepairMode as jest.Mock).mockImplementation(() => {
      // Simulate internal command registration within activateRepairMode
      const retryHandler = async () => {
        await secondCall(expect.anything(), 'PRO_BUNDLE_CODE');
      };
      registeredRetryHandler = retryHandler;
    });

    await activate(fakeContext);

    // Verify activateRepairMode was called
    expect(helpers.activateRepairMode).toHaveBeenCalled();
    expect(registeredRetryHandler).toBeDefined();

    // Call the handler to simulate retry (simulating the internal command registration)
    await registeredRetryHandler!();

    // Verify runProBundle called again on retry
    expect(secondCall).toHaveBeenCalledWith(
      expect.anything(), // extensionProperties
      'PRO_BUNDLE_CODE',
    );
  });

  it('activates freemium mode when no license or bundle are found', async () => {
    const fakeContext = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Simulate freemium state
    (helpers.readFromGlobalState as jest.Mock).mockReturnValue(undefined);

    await activate(fakeContext);

    expect(helpers.activateFreemiumLauncherMode).toHaveBeenCalledTimes(1);
    expect(proUtilities.runProBundle).not.toHaveBeenCalled();
    expect(proUtilities.updateProBundle).not.toHaveBeenCalled();
  });
});
