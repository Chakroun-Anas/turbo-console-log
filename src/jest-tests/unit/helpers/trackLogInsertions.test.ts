import * as vscode from 'vscode';
import { trackLogInsertions } from '@/helpers/trackLogInsertions';
import { readFromGlobalState, writeToGlobalState, isProUser } from '@/helpers';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
}));

describe('trackLogInsertions', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('when user is a Pro user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 25;
        return undefined;
      });
    });

    it('should increment counter', async () => {
      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        26,
      );
    });

    it('should increment counter at any count', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 49;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        50,
      );
    });

    it('should update last insertion date', async () => {
      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'LAST_INSERTION_DATE',
        expect.any(Number),
      );
    });
  });

  describe('when user is a free user', () => {
    beforeEach(() => {
      mockIsProUser.mockReturnValue(false);
    });

    it('should increment command usage count', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        6,
      );
    });

    it('should update last insertion date on every call', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      // Should write LAST_INSERTION_DATE with normalized date (midnight)
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'LAST_INSERTION_DATE',
        expect.any(Number),
      );
    });

    it('should handle undefined command usage count as 0', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'COMMAND_USAGE_COUNT') return undefined;
        return undefined;
      });

      await trackLogInsertions(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        1,
      );
    });
  });
});
