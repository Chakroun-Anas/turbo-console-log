import * as vscode from 'vscode';
import { activationDaySevenHandler } from '@/helpers/listenToActivationDaySeven';
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

describe('activationDaySevenHandler', () => {
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

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TEN_DAYS_MS = 10 * ONE_DAY_MS;
  const TWO_WEEKS_MS = 14 * ONE_DAY_MS;

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

      const result = activationDaySevenHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should not register handler if notification already shown', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return true;
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldRegister(context);

      expect(mockReadFromGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
      );
      expect(result).toBe(false);
    });

    it('should not register if user has already used the extension (commandUsageCount > 0)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
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

      const result = activationDaySevenHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should register for free users with zero usage who have not seen Day 7 notification', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldRegister(context);

      expect(result).toBe(true);
    });

    it('should register when COMMAND_USAGE_COUNT is undefined (defaults to 0)', () => {
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (
          key === GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION
        ) {
          return false;
        }
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return undefined;
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldRegister(context);

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

    it('should process JS/TS files within valid window', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS; // 10 days - valid window
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldProcess(
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

      const result = activationDaySevenHandler.shouldProcess(mdEditor, context);

      expect(result).toBe(false);
    });

    it('should not process if usage count > 0', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 5;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TEN_DAYS_MS;
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldProcess(
        mockEditor,
        context,
      );

      expect(result).toBe(false);
    });

    it('should not process if before 7 day window', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - 5 * ONE_DAY_MS; // 5 days - too early
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldProcess(
        mockEditor,
        context,
      );

      expect(result).toBe(false);
    });

    it('should not process if after 14 day window', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.COMMAND_USAGE_COUNT) {
          return 0;
        }
        if (key === GlobalStateKey.ACTIVITY_CHECK_START_DATE) {
          return Date.now() - TWO_WEEKS_MS; // 14 days - too late
        }
        return undefined;
      });

      const result = activationDaySevenHandler.shouldProcess(
        mockEditor,
        context,
      );

      expect(result).toBe(false);
    });
  });

  describe('process - calls showNotification', () => {
    const mockDocument = {
      fileName: 'test.ts',
      uri: { fsPath: 'test.ts' },
    } as vscode.TextDocument;

    const mockEditor = {
      document: mockDocument,
    } as vscode.TextEditor;

    it('should call showNotification with correct parameters', async () => {
      mockShowNotification.mockResolvedValue(true);

      const result = await activationDaySevenHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        testVersion,
        context,
      );
      expect(result).toBe(true);
    });

    it('should mark notification as shown when successful', async () => {
      mockShowNotification.mockResolvedValue(true);

      await activationDaySevenHandler.process(mockEditor, context, testVersion);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        context,
        GlobalStateKey.HAS_SHOWN_ACTIVATION_DAY_SEVEN_NOTIFICATION,
        true,
      );
    });

    it('should not mark as shown when blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false);

      const result = await activationDaySevenHandler.process(
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

      await activationDaySevenHandler.process(
        mockEditor,
        context,
        customVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVATION_DAY_SEVEN,
        customVersion,
        context,
      );
    });
  });
});
