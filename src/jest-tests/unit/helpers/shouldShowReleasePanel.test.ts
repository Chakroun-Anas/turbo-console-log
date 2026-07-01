import * as vscode from 'vscode';
import { shouldShowReleasePanel } from '../../../helpers/shouldShowReleasePanel';
import * as readFromGlobalStateModule from '../../../helpers/readFromGlobalState';

jest.mock('../../../helpers/readFromGlobalState');

describe('shouldShowReleasePanel', () => {
  const mockContext = {} as vscode.ExtensionContext;
  let mockReadFromGlobalState: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFromGlobalState = jest.spyOn(
      readFromGlobalStateModule,
      'readFromGlobalState',
    );
  });

  describe('version guard', () => {
    it('returns false when version is not in RELEASE_PANEL_VERSIONS', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const result = await shouldShowReleasePanel(mockContext, '3.24.0');

      expect(result).toBe(false);
      expect(mockReadFromGlobalState).not.toHaveBeenCalled();
    });

    it('returns false for an entirely unknown version', async () => {
      const result = await shouldShowReleasePanel(mockContext, '99.0.0');

      expect(result).toBe(false);
    });
  });

  describe('local state guard (purely local, no network call)', () => {
    it('returns false when local state says already shown', async () => {
      mockReadFromGlobalState.mockReturnValue(true);

      const result = await shouldShowReleasePanel(mockContext, '3.25.0');

      expect(result).toBe(false);
    });

    it('returns true when local state has no record of the panel being shown', async () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const result = await shouldShowReleasePanel(mockContext, '3.25.0');

      expect(result).toBe(true);
    });

    it('reads the correct state key combining prefix and version', async () => {
      mockReadFromGlobalState.mockReturnValue(true);

      await shouldShowReleasePanel(mockContext, '3.25.0');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        expect.stringContaining('3.25.0'),
      );
    });
  });
});
