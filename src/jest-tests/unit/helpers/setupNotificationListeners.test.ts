import * as vscode from 'vscode';
import { setupNotificationListeners } from '@/helpers/setupNotificationListeners';
import * as listenToFileOpeningNotifications from '@/helpers/listenToFileOpeningNotifications';
import * as listenToManualConsoleLogs from '@/helpers/listenToManualConsoleLogs';

jest.mock('@/helpers/listenToFileOpeningNotifications');
jest.mock('@/helpers/listenToManualConsoleLogs');

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
      expect.any(Array), // allNotificationHandlers array (reduced to 2 in v3.21.2)
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

  it('should set up core listeners only (v3.21.2 - PLG marketing notifications removed)', () => {
    const version = '3.21.2';

    setupNotificationListeners(mockContext, version);

    // Verify only 2 core listeners are called (removed 3 PLG marketing listeners)
    expect(
      listenToFileOpeningNotifications.listenToFileOpeningNotifications,
    ).toHaveBeenCalled();
    expect(
      listenToManualConsoleLogs.listenToManualConsoleLogs,
    ).toHaveBeenCalled();
  });
});
