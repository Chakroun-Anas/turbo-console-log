import * as vscode from 'vscode';
import axios from 'axios';
import { shouldShowReleasePanel } from '../../../helpers/shouldShowReleasePanel';
import * as readFromGlobalStateModule from '../../../helpers/readFromGlobalState';

jest.mock('../../../helpers/readFromGlobalState');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('returns false for an entirely unknown version', async () => {
      const result = await shouldShowReleasePanel(mockContext, '99.0.0');

      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('local state guard', () => {
    it('returns false immediately when local state says already shown', async () => {
      mockReadFromGlobalState.mockReturnValue(true);

      const result = await shouldShowReleasePanel(
        mockContext,
        '3.25.0',
        'dev_abc123',
      );

      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('reads the correct state key combining prefix and version', async () => {
      mockReadFromGlobalState.mockReturnValue(true);

      await shouldShowReleasePanel(mockContext, '3.25.0', 'dev_abc123');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        expect.stringContaining('3.25.0'),
      );
    });
  });

  describe('server-side guard (local state is clear)', () => {
    beforeEach(() => {
      mockReadFromGlobalState.mockReturnValue(undefined);
    });

    it('returns true when server confirms panel has not been shown', async () => {
      mockedAxios.get.mockResolvedValue({ data: { hasBeenShown: false } });

      const result = await shouldShowReleasePanel(
        mockContext,
        '3.25.0',
        'dev_abc123',
      );

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/releasePanelShownCheck'),
        expect.objectContaining({
          params: { developerId: 'dev_abc123', version: '3.25.0' },
        }),
      );
    });

    it('returns false when server confirms panel has already been shown', async () => {
      mockedAxios.get.mockResolvedValue({ data: { hasBeenShown: true } });

      const result = await shouldShowReleasePanel(
        mockContext,
        '3.25.0',
        'dev_abc123',
      );

      expect(result).toBe(false);
    });

    it('fails open — returns true when the server request throws', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await shouldShowReleasePanel(
        mockContext,
        '3.25.0',
        'dev_abc123',
      );

      expect(result).toBe(true);
    });

    it('fails open — returns true when the request times out', async () => {
      mockedAxios.get.mockRejectedValue(new Error('timeout of 3000ms exceeded'));

      const result = await shouldShowReleasePanel(
        mockContext,
        '3.25.0',
        'dev_abc123',
      );

      expect(result).toBe(true);
    });

    it('skips the server check and returns true when no developerId is provided', async () => {
      const result = await shouldShowReleasePanel(mockContext, '3.25.0');

      expect(result).toBe(true);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
