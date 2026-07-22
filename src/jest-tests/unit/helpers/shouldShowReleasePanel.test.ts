import * as vscode from 'vscode';
import { shouldShowReleasePanel } from '../../../helpers/shouldShowReleasePanel';
import * as readFromGlobalStateModule from '../../../helpers/readFromGlobalState';
import * as writeToGlobalStateModule from '../../../helpers/writeToGlobalState';

jest.mock('../../../helpers/readFromGlobalState');
jest.mock('../../../helpers/writeToGlobalState');

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

describe('shouldShowReleasePanel', () => {
  const mockContext = {} as vscode.ExtensionContext;
  let mockReadFromGlobalState: jest.SpyInstance;
  let mockWriteToGlobalState: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFromGlobalState = jest.spyOn(
      readFromGlobalStateModule,
      'readFromGlobalState',
    );
    mockWriteToGlobalState = jest
      .spyOn(writeToGlobalStateModule, 'writeToGlobalState')
      .mockResolvedValue(undefined);
  });

  // Returns different values per key, matching the "shown" vs "first seen"
  // state keys the function reads — mirrors real globalState behavior.
  function mockState({
    hasShown,
    firstSeenAt,
  }: {
    hasShown?: boolean;
    firstSeenAt?: number;
  }) {
    mockReadFromGlobalState.mockImplementation(
      (_context: unknown, key: string) => {
        if (key.includes('HAS_SHOWN_RELEASE_PANEL')) return hasShown;
        if (key.includes('RELEASE_PANEL_FIRST_SEEN')) return firstSeenAt;
        return undefined;
      },
    );
  }

  describe('version guard', () => {
    it('returns false when version is not in RELEASE_PANEL_VERSIONS', async () => {
      mockState({});

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
      mockState({ hasShown: true });

      const result = await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(result).toBe(false);
    });

    it('returns true and records first-seen when there is no record of the panel being shown', async () => {
      mockState({ hasShown: undefined, firstSeenAt: undefined });

      const result = await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(result).toBe(true);
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        expect.stringContaining('3.27.0'),
        expect.any(Number),
      );
    });

    it('reads the correct state key combining prefix and version', async () => {
      mockState({ hasShown: true });

      await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        expect.stringContaining('3.27.0'),
      );
    });

    it('returns false for a retired release version, without touching local state', async () => {
      mockState({ hasShown: undefined, firstSeenAt: undefined });

      expect(await shouldShowReleasePanel(mockContext, '3.25.0')).toBe(false);
      expect(await shouldShowReleasePanel(mockContext, '3.26.0')).toBe(false);
      expect(mockReadFromGlobalState).not.toHaveBeenCalled();
    });
  });

  describe('3-day auto-expiry (unresponsive user)', () => {
    it('keeps showing the panel within the 3-day grace window', async () => {
      const firstSeenAt = Date.now() - (THREE_DAYS_MS - 1000);
      mockState({ hasShown: undefined, firstSeenAt });

      const result = await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(result).toBe(true);
      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });

    it('stops showing the panel once 3 days have passed since first seen, even if never dismissed', async () => {
      const firstSeenAt = Date.now() - (THREE_DAYS_MS + 1000);
      mockState({ hasShown: undefined, firstSeenAt });

      const result = await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(result).toBe(false);
    });

    it('does not overwrite an existing first-seen timestamp on subsequent activations', async () => {
      const firstSeenAt = Date.now() - 1000;
      mockState({ hasShown: undefined, firstSeenAt });

      await shouldShowReleasePanel(mockContext, '3.27.0');

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });
});
