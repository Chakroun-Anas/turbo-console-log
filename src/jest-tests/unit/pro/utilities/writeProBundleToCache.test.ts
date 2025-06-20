import * as vscode from 'vscode';
import { writeProBundleToCache } from '../../../../pro/utilities/';
import * as helpers from '../../../../helpers';

jest.mock('../../../../helpers');

describe('writeProBundleToCache', () => {
  const mockContext = {} as vscode.ExtensionContext;

  it('writes license key, pro bundle, and version to global state', () => {
    const mockWrite = jest
      .spyOn(helpers, 'writeToGlobalState')
      .mockImplementation(() => {});

    writeProBundleToCache(
      mockContext,
      'LICENSE123',
      'PRO_BUNDLE_CODE',
      '2.17.0',
    );

    expect(mockWrite).toHaveBeenCalledTimes(3);
    expect(mockWrite).toHaveBeenNthCalledWith(
      1,
      mockContext,
      'license-key',
      'LICENSE123',
    );
    expect(mockWrite).toHaveBeenNthCalledWith(
      2,
      mockContext,
      'pro-bundle',
      'PRO_BUNDLE_CODE',
    );
    expect(mockWrite).toHaveBeenNthCalledWith(
      3,
      mockContext,
      'version',
      '2.17.0',
    );

    mockWrite.mockRestore();
  });
});
