import * as vscode from 'vscode';
import { activationDayThreeHandler } from '@/helpers/listenToActivationDayThree';
import {
  readFromGlobalState,
  writeToGlobalState,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  isProUser: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('activationDayThreeHandler', () => {
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsJavaScriptOrTypeScriptFile =
    isJavaScriptOrTypeScriptFile as jest.MockedFunction<
      typeof isJavaScriptOrTypeScriptFile
    >;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let context: vscode.ExtensionContext;
  const testVersion = '3.17.0';

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();

    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);

    // Default mocks
    mockIsProUser.mockReturnValue(false);
    mockReadFromGlobalState.mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldRegister - setup-time filters', () => {
    it('should not register handler for Pro users', () => {
      mockIsProUser.mockReturnValue(true);

      const result = activationDayThreeHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should not register handler if notification already shown', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      const result = activationDayThreeHandler.shouldRegister(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION,
      );
      expect(result).toBe(false);
    });

    it('should not register if user has already used the extension (commandUsageCount > 0)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 5;
        }
        return undefined;
      });

      const result = activationDayThreeHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should register for free users with zero usage who have not seen notification', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        return undefined;
      });

      const result = activationDayThreeHandler.shouldRegister(context);

      expect(result).toBe(true);
    });

    it('should register when COMMAND_USAGE_COUNT is undefined (defaults to 0)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return undefined;
        }
        return undefined;
      });

      const result = activationDayThreeHandler.shouldRegister(context);

      expect(result).toBe(true);
    });
  });

  describe('shouldProcess - runtime filtering', () => {
    const mockDocument = {
      fileName: 'test.ts',
      uri: { fsPath: 'test.ts' },
    } as vscode.TextDocument;

    const mockEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    it('should process JS/TS files', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);

      // Mock COMMAND_USAGE_COUNT as 0
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          // Set to 4 days ago (within 3-7 day window)
          const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
          return Date.now() - FOUR_DAYS_MS;
        }
        return undefined;
      });

      const result = activationDayThreeHandler.shouldProcess(
        mockEditor,
        context,
      );

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(result).toBe(true);
    });

    it('should not process non-JS/TS files', () => {
      const mdDocument = {
        fileName: 'test.md',
        uri: { fsPath: 'test.md' },
      } as vscode.TextDocument;

      const mdEditor = {
        document: mdDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      const result = activationDayThreeHandler.shouldProcess(mdEditor, context);

      expect(result).toBe(false);
    });
  });

  describe('process', () => {
    const mockDocument = {
      fileName: 'test.ts',
      uri: { fsPath: 'test.ts' },
    } as vscode.TextDocument;

    const mockEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    it('should call showNotification with correct parameters', async () => {
      mockShowNotification.mockResolvedValue(true);

      const result = await activationDayThreeHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_THREE,
        testVersion,
        context,
      );
      expect(result).toBe(true);
    });

    it('should mark notification as shown when successful', async () => {
      mockShowNotification.mockResolvedValue(true);

      await activationDayThreeHandler.process(mockEditor, context, testVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_THREE_NOTIFICATION,
        true,
      );
    });

    it('should not mark as shown when blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false);

      const result = await activationDayThreeHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should pass custom version parameter', async () => {
      mockShowNotification.mockResolvedValue(true);
      const customVersion = '4.0.0';

      await activationDayThreeHandler.process(
        mockEditor,
        context,
        customVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_THREE,
        customVersion,
        context,
      );
    });
  });
});
