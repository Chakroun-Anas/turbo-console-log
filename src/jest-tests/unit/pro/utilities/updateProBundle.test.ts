import { updateProBundle } from '../../../../pro/utilities/updateProBundle';
import * as proUtilities from '../../../../pro/utilities';
import * as vscode from 'vscode';
import { ExtensionProperties } from '../../../../entities';
import { showNotification } from '../../../../ui';

jest.mock('../../../../pro/utilities/isOnline');
jest.mock('../../../../pro/utilities/fetchProBundle');
jest.mock('../../../../pro/utilities/writeProBundleToCache');
jest.mock('../../../../pro/utilities/runProBundle');
jest.mock('../../../../ui');

describe('updateProBundle', () => {
  const fakeContext = {} as vscode.ExtensionContext;
  const fakeProps = {} as ExtensionProperties;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows error if offline', async () => {
    jest.spyOn(proUtilities, 'isOnline').mockResolvedValue(false);

    await expect(
      updateProBundle(fakeContext, '3.0.0', 'LICENSE123', fakeProps),
    ).rejects.toThrow(/No internet connection/);

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('please check the Turbo Pro panel'),
    );
  });
  it('successfully fetches and runs the pro bundle', async () => {
    const mockBundle = 'FAKE_BUNDLE_CODE';

    jest.mocked(proUtilities.isOnline).mockResolvedValue(true);
    jest.mocked(proUtilities.fetchProBundle).mockResolvedValue(mockBundle);

    await updateProBundle(fakeContext, '3.0.0', 'LICENSE123', fakeProps);

    expect(proUtilities.fetchProBundle).toHaveBeenCalledWith(
      'LICENSE123',
      '3.0.0',
    );
    expect(proUtilities.writeProBundleToCache).toHaveBeenCalledWith(
      fakeContext,
      'LICENSE123',
      mockBundle,
      '3.0.0',
    );
    expect(proUtilities.runProBundle).toHaveBeenCalledWith(
      fakeProps,
      mockBundle,
    );
    expect(showNotification).toHaveBeenCalledWith(
      expect.stringContaining(
        "Pro Bundle Updated v3.0.0, don't forget to reload your window!",
      ),
      10000,
    );
  });
  it('shows error and throws if fetchProBundle fails', async () => {
    jest.mocked(proUtilities.isOnline).mockResolvedValue(true);
    const error = new Error('fetch failed');
    jest.mocked(proUtilities.fetchProBundle).mockRejectedValue(error);

    await expect(
      updateProBundle(fakeContext, '3.0.0', 'LICENSE123', fakeProps),
    ).rejects.toThrow('fetch failed');

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('fetch failed');
    expect(console.error).toHaveBeenCalledWith(
      'Turbo Pro update failed: ',
      error,
    );
  });
  it('shows error and throws if writeProBundleToCache fails', async () => {
    jest.mocked(proUtilities.isOnline).mockResolvedValue(true);
    const error = new Error('write failed');
    jest.mocked(proUtilities.fetchProBundle).mockResolvedValue('FAKE_BUNDLE');
    jest.mocked(proUtilities.writeProBundleToCache).mockImplementation(() => {
      throw error;
    });

    await expect(
      updateProBundle(fakeContext, '3.0.0', 'LICENSE123', fakeProps),
    ).rejects.toThrow('write failed');

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('write failed');
    expect(console.error).toHaveBeenCalledWith(
      'Turbo Pro update failed: ',
      error,
    );
  });
  it('shows error and throws if runProBundle fails', async () => {
    jest.mocked(proUtilities.isOnline).mockResolvedValue(true);
    const error = new Error('run failed');
    jest.mocked(proUtilities.fetchProBundle).mockResolvedValue('FAKE_BUNDLE');
    jest
      .mocked(proUtilities.writeProBundleToCache)
      .mockImplementation(() => {});
    jest.mocked(proUtilities.runProBundle).mockImplementation(() => {
      throw error;
    });

    await expect(
      updateProBundle(fakeContext, '3.0.0', 'LICENSE123', fakeProps),
    ).rejects.toThrow('run failed');

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('run failed');
    expect(console.error).toHaveBeenCalledWith(
      'Turbo Pro update failed: ',
      error,
    );
  });
});
