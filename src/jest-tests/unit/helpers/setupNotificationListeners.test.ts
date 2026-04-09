import * as vscode from 'vscode';
import { setupNotificationListeners } from '@/helpers/setupNotificationListeners';
import * as listenToFileOpeningNotifications from '@/helpers/listenToFileOpeningNotifications';
import * as listenToManualConsoleLogs from '@/helpers/listenToManualConsoleLogs';
import * as listenToCommitWithLogs from '@/helpers/listenToCommitWithLogs';
import * as listenToLogLibraryInstalled from '@/helpers/listenToLogLibraryInstalled';
import * as listenToWeekendTurboSundays from '@/helpers/listenToWeekendTurboSundays';

jest.mock('@/helpers/listenToFileOpeningNotifications');
jest.mock('@/helpers/listenToManualConsoleLogs');
jest.mock('@/helpers/listenToCommitWithLogs');
jest.mock('@/helpers/listenToLogLibraryInstalled');
jest.mock('@/helpers/listenToWeekendTurboSundays');

describe('setupNotificationListeners', () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      globalState: {} as vscode.Memento,
      workspaceState: {} as vscode.Memento,
    } as unknown as vscode.ExtensionContext;
  });

  it('should call listenToFileOpeningNotifications with context, version, and handlers', () => {
    const version = '3.10.0';

    setupNotificationListeners(mockContext, version);

    expect(
      listenToFileOpeningNotifications.listenToFileOpeningNotifications,
    ).toHaveBeenCalledWith(
      mockContext,
      version,
      expect.any(Array), // allNotificationHandlers array
    );
    expect(
      listenToFileOpeningNotifications.listenToFileOpeningNotifications,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call listenToManualConsoleLogs with context', () => {
    const version = '3.10.0';

    setupNotificationListeners(mockContext, version);

    expect(
      listenToManualConsoleLogs.listenToManualConsoleLogs,
    ).toHaveBeenCalledWith(mockContext);
    expect(
      listenToManualConsoleLogs.listenToManualConsoleLogs,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call listenToCommitWithLogs with context and version', () => {
    const version = '3.10.0';

    setupNotificationListeners(mockContext, version);

    expect(listenToCommitWithLogs.listenToCommitWithLogs).toHaveBeenCalledWith(
      mockContext,
      version,
    );
    expect(listenToCommitWithLogs.listenToCommitWithLogs).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call listenToLogLibraryInstalled with context and version', () => {
    const version = '3.10.0';

    setupNotificationListeners(mockContext, version);

    expect(
      listenToLogLibraryInstalled.listenToLogLibraryInstalled,
    ).toHaveBeenCalledWith(mockContext, version);
    expect(
      listenToLogLibraryInstalled.listenToLogLibraryInstalled,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call listenToWeekendTurboSundays with context and version', () => {
    const version = '3.14.1';

    setupNotificationListeners(mockContext, version);

    expect(
      listenToWeekendTurboSundays.listenToWeekendTurboSundays,
    ).toHaveBeenCalledWith(mockContext, version);
    expect(
      listenToWeekendTurboSundays.listenToWeekendTurboSundays,
    ).toHaveBeenCalledTimes(1);
  });

  it('should set up all listeners in the correct order', () => {
    const version = '3.15.0';

    setupNotificationListeners(mockContext, version);

    // Verify all five listeners were called
    expect(
      listenToFileOpeningNotifications.listenToFileOpeningNotifications,
    ).toHaveBeenCalled();
    expect(
      listenToManualConsoleLogs.listenToManualConsoleLogs,
    ).toHaveBeenCalled();
    expect(listenToCommitWithLogs.listenToCommitWithLogs).toHaveBeenCalled();
    expect(
      listenToLogLibraryInstalled.listenToLogLibraryInstalled,
    ).toHaveBeenCalled();
    expect(
      listenToWeekendTurboSundays.listenToWeekendTurboSundays,
    ).toHaveBeenCalled();
  });
});
