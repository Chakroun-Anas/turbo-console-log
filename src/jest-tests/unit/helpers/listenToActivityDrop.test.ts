import * as vscode from 'vscode';
import { activityDropHandler } from '@/helpers/listenToActivityDrop';
import {
  readFromGlobalState,
  writeToGlobalState,
  getUserActivityStatus,
  isProUser,
  isJavaScriptOrTypeScriptFile,
} from '@/helpers';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import { GlobalStateKey, UserActivityStatus } from '@/entities';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  getUserActivityStatus: jest.fn(),
  isProUser: jest.fn(),
  isJavaScriptOrTypeScriptFile: jest.fn(),
}));

jest.mock('@/notifications/showNotification', () => ({
  showNotification: jest.fn(),
}));

describe('activityDropHandler', () => {
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
  const mockGetUserActivityStatus =
    getUserActivityStatus as jest.MockedFunction<typeof getUserActivityStatus>;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let context: vscode.ExtensionContext;
  const testVersion = '3.16.1';

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

      const result = activityDropHandler.shouldRegister(context);

      expect(result).toBe(false);
    });

    it('should register for free users (no permanent flag check since repeating event)', () => {
      const result = activityDropHandler.shouldRegister(context);

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

    it('should not process non-JS/TS files', () => {
      const mdDocument = {
        fileName: 'test.md',
        uri: { fsPath: 'test.md' },
      } as vscode.TextDocument;

      const mdEditor = {
        document: mdDocument,
      } as vscode.TextEditor;

      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(false);

      const result = activityDropHandler.shouldProcess(mdEditor, context);

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(mdDocument);
      expect(result).toBe(false);
    });

    it('should process JS/TS files', () => {
      mockIsJavaScriptOrTypeScriptFile.mockReturnValue(true);
      mockGetUserActivityStatus.mockReturnValue(UserActivityStatus.ACTIVE);
      mockReadFromGlobalState.mockImplementation((ctx, key) => {
        if (key === GlobalStateKey.LAST_INSERTION_DATE) {
          const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
          return Date.now() - FIVE_DAYS_MS; // Within 4-7 day window
        }
        return undefined;
      });

      const result = activityDropHandler.shouldProcess(mockEditor, context);

      expect(mockIsJavaScriptOrTypeScriptFile).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(result).toBe(true);
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

      const result = await activityDropHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        testVersion,
        context,
      );
      expect(result).toBe(true);
    });

    it('should return true when notification shown', async () => {
      mockShowNotification.mockResolvedValue(true);

      const result = await activityDropHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(result).toBe(true);
    });

    it('should return false when notification blocked by cooldown', async () => {
      mockShowNotification.mockResolvedValue(false);

      const result = await activityDropHandler.process(
        mockEditor,
        context,
        testVersion,
      );

      expect(result).toBe(false);
    });

    it('should pass custom version parameter', async () => {
      mockShowNotification.mockResolvedValue(true);
      const customVersion = '4.0.0';

      await activityDropHandler.process(mockEditor, context, customVersion);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_ACTIVITY_DROP,
        customVersion,
        context,
      );
    });

    it('should not write any permanent flag (repeating event)', async () => {
      mockShowNotification.mockResolvedValue(true);

      await activityDropHandler.process(mockEditor, context, testVersion);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
    });
  });
});
