import * as vscode from 'vscode';
import {
  trackLogManagementCommands,
  LogManagementCommandType,
} from '@/helpers/trackLogManagementCommands';
import { readFromGlobalState, writeToGlobalState } from '@/helpers';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  ...jest.requireActual('@/helpers'),
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
}));

describe('trackLogManagementCommands', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('Counter increments for all users', () => {
    it('should increment general counter', () => {
      mockReadFromGlobalState.mockReturnValue(3);

      trackLogManagementCommands(mockContext, 'comment');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        4,
      );
    });

    it('should increment counter at milestone (5 commands)', () => {
      mockReadFromGlobalState.mockReturnValue(4);

      trackLogManagementCommands(mockContext, 'uncomment');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        5,
      );
    });

    it('should track both general and command-specific counts', () => {
      mockReadFromGlobalState.mockImplementation((_, key) => {
        if (key === GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT) return 4;
        if (key === GlobalStateKey.DELETE_COMMAND_USAGE_COUNT) return 4;
        return undefined;
      });

      trackLogManagementCommands(mockContext, 'delete');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        5,
      );
      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.DELETE_COMMAND_USAGE_COUNT,
        5,
      );
    });
  });

  describe('Basic counter behavior', () => {
    it('should increment command usage count', () => {
      mockReadFromGlobalState.mockReturnValue(2);

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        3,
      );
    });

    it('should handle undefined counter (first use)', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      trackLogManagementCommands(mockContext, 'delete');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1,
      );
    });

    it('should continue incrementing beyond milestone', () => {
      mockReadFromGlobalState.mockReturnValue(5);

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        6,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large count numbers', () => {
      mockReadFromGlobalState.mockReturnValue(999);

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1000,
      );
    });

    it('should handle zero count', () => {
      mockReadFromGlobalState.mockReturnValue(0);

      trackLogManagementCommands(mockContext, 'uncomment');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        1,
      );
    });
  });

  describe('State Management Integration', () => {
    it('should use GlobalStateKey enum for counter', () => {
      mockReadFromGlobalState.mockReturnValue(4);

      trackLogManagementCommands(mockContext, 'correct');

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
        expect.any(Number),
      );
    });
  });

  describe('Command-specific tracking', () => {
    describe('comment command tracking', () => {
      it('should increment both general and comment-specific counters', () => {
        mockReadFromGlobalState.mockReturnValue(0);

        trackLogManagementCommands(mockContext, 'comment');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.COMMENT_COMMAND_USAGE_COUNT,
          1,
        );
      });
    });

    describe('uncomment command tracking', () => {
      it('should increment both general and uncomment-specific counters', () => {
        mockReadFromGlobalState.mockReturnValue(0);

        trackLogManagementCommands(mockContext, 'uncomment');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.UNCOMMENT_COMMAND_USAGE_COUNT,
          1,
        );
      });
    });

    describe('delete command tracking', () => {
      it('should increment both general and delete-specific counters', () => {
        mockReadFromGlobalState.mockReturnValue(0);

        trackLogManagementCommands(mockContext, 'delete');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.DELETE_COMMAND_USAGE_COUNT,
          1,
        );
      });
    });

    describe('correct command tracking', () => {
      it('should increment both general and correction-specific counters', () => {
        mockReadFromGlobalState.mockReturnValue(0);

        trackLogManagementCommands(mockContext, 'correct');

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
          1,
        );
        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          GlobalStateKey.CORRECTION_COMMAND_USAGE_COUNT,
          1,
        );
      });
    });

    describe('mixed command usage patterns', () => {
      it('should handle user doing mix of commands', () => {
        const commandSequence: LogManagementCommandType[] = [
          'comment',
          'delete',
          'uncomment',
          'comment',
        ];

        commandSequence.forEach((cmd, index) => {
          mockReadFromGlobalState.mockReturnValue(index);

          trackLogManagementCommands(mockContext, cmd);

          expect(mockWriteToGlobalState).toHaveBeenCalledWith(
            mockContext,
            GlobalStateKey.LOG_MANAGEMENT_COMMAND_USAGE_COUNT,
            index + 1,
          );
        });
      });
    });
  });
});
