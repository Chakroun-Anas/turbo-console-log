import * as vscode from 'vscode';
import { trackPanelOpenings } from '@/helpers/trackPanelOpenings';
import { readFromGlobalState, writeToGlobalState } from '@/helpers/index';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock dependencies
jest.mock('@/helpers/index');

const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
  typeof readFromGlobalState
>;
const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
  typeof writeToGlobalState
>;

describe('trackPanelOpenings', () => {
  let context: vscode.ExtensionContext;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Default mock implementations
    mockReadFromGlobalState.mockReturnValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Panel Opening Count Tracking', () => {
    it('should initialize count to 1 when no previous count exists', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1,
      );
    });

    it('should increment existing count', () => {
      mockReadFromGlobalState.mockReturnValue(5);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        6,
      );
    });

    it('should handle count of 0 correctly', () => {
      mockReadFromGlobalState.mockReturnValue(0);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1,
      );
    });

    it('should increment panel opening count correctly', () => {
      mockReadFromGlobalState.mockReturnValue(7);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        8,
      );
    });

    it('should handle very large count numbers', () => {
      mockReadFromGlobalState.mockReturnValue(999);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        1000,
      );
    });
  });

  describe('State Management Integration', () => {
    it('should read panel count from correct global state key', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      trackPanelOpenings(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
      );
    });

    it('should write updated count to correct global state key', () => {
      mockReadFromGlobalState.mockReturnValue(5);

      trackPanelOpenings(context);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.PANEL_OPENING_COUNT,
        6,
      );
    });
  });
});
