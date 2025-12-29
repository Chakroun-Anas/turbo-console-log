import * as vscode from 'vscode';
import { getUserActivityStatus } from '@/helpers/getUserActivityStatus';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers/readFromGlobalState');

describe('getUserActivityStatus', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;

  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();
  });

  describe('when user activity status exists', () => {
    it('should return ACTIVE status when stored', () => {
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.ACTIVE);

      const status = getUserActivityStatus(mockContext);

      expect(status).toBe(UserActivityStatus.ACTIVE);
    });

    it('should return INACTIVE status when stored', () => {
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.INACTIVE);

      const status = getUserActivityStatus(mockContext);

      expect(status).toBe(UserActivityStatus.INACTIVE);
    });

    it('should call readFromGlobalState with correct key', () => {
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.ACTIVE);

      getUserActivityStatus(mockContext);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.USER_ACTIVITY_STATUS,
      );
    });

    it('should call readFromGlobalState exactly once', () => {
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.INACTIVE);

      getUserActivityStatus(mockContext);

      expect(mockReadFromGlobalState).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user activity status does not exist', () => {
    it('should return undefined when status not yet set', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      const status = getUserActivityStatus(mockContext);

      expect(status).toBeUndefined();
    });

    it('should still call readFromGlobalState with correct parameters', () => {
      mockReadFromGlobalState.mockReturnValue(undefined);

      getUserActivityStatus(mockContext);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        mockContext,
        GlobalStateKey.USER_ACTIVITY_STATUS,
      );
    });
  });

  describe('type safety verification', () => {
    it('should handle only valid UserActivityStatus enum values', () => {
      // Test ACTIVE
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.ACTIVE);
      let status = getUserActivityStatus(mockContext);
      expect(status).toBe('ACTIVE');

      // Test INACTIVE
      mockReadFromGlobalState.mockReturnValue(UserActivityStatus.INACTIVE);
      status = getUserActivityStatus(mockContext);
      expect(status).toBe('INACTIVE');

      // Test undefined
      mockReadFromGlobalState.mockReturnValue(undefined);
      status = getUserActivityStatus(mockContext);
      expect(status).toBeUndefined();
    });
  });
});
