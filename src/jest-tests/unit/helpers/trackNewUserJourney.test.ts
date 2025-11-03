import * as vscode from 'vscode';
import { trackNewUserJourney } from '@/helpers/trackNewUserJourney';
import {
  readFromGlobalState,
  writeToGlobalState,
  isFreshInstall,
} from '@/helpers';
import { createTelemetryService } from '@/telemetry';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

// Mock the dependencies
jest.mock('@/helpers', () => ({
  readFromGlobalState: jest.fn(),
  writeToGlobalState: jest.fn(),
  showNewsletterStatusBar: jest.fn(),
  isFreshInstall: jest.fn(),
}));

jest.mock('@/telemetry', () => ({
  createTelemetryService: jest.fn(),
}));

jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
  },
  env: {
    openExternal: jest.fn(),
  },
  Uri: {
    parse: jest.fn(),
  },
}));

describe('trackNewUserJourney', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;
  const mockWriteToGlobalState = writeToGlobalState as jest.MockedFunction<
    typeof writeToGlobalState
  >;
  const mockIsFreshInstall = isFreshInstall as jest.MockedFunction<
    typeof isFreshInstall
  >;
  const mockCreateTelemetryService =
    createTelemetryService as jest.MockedFunction<
      typeof createTelemetryService
    >;
  const mockOpenExternal = vscode.env.openExternal as jest.MockedFunction<
    typeof vscode.env.openExternal
  >;
  const mockUriParse = vscode.Uri.parse as jest.MockedFunction<
    typeof vscode.Uri.parse
  >;
  const mockShowInformationMessage = vscode.window
    .showInformationMessage as jest.MockedFunction<
    typeof vscode.window.showInformationMessage
  >;

  let mockContext: vscode.ExtensionContext;
  let mockTelemetryService: {
    reportCommandsInserted: jest.MockedFunction<
      (context: vscode.ExtensionContext, count: number) => Promise<void>
    >;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = makeExtensionContext();

    mockTelemetryService = {
      reportCommandsInserted: jest.fn().mockResolvedValue(undefined),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateTelemetryService.mockReturnValue(mockTelemetryService as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUriParse.mockReturnValue('https://www.turboconsolelog.io/join' as any);

    // Mock showInformationMessage to return a resolved promise
    mockShowInformationMessage.mockResolvedValue(undefined);
  });

  describe('when user is not new', () => {
    beforeEach(() => {
      // Mock isFreshInstall to return false (existing user)
      mockIsFreshInstall.mockReturnValue(false);

      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return false;
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        return undefined;
      });
    });

    it('should return early and not track anything', async () => {
      await trackNewUserJourney(mockContext);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockShowInformationMessage).not.toHaveBeenCalled();
      expect(
        mockTelemetryService.reportCommandsInserted,
      ).not.toHaveBeenCalled();
    });
  });

  describe('when user has already seen milestone notification', () => {
    beforeEach(() => {
      // Mock isFreshInstall to return true (fresh install)
      mockIsFreshInstall.mockReturnValue(true);

      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return true;
        if (key === 'COMMAND_USAGE_COUNT') return 15;
        return undefined;
      });
    });

    it('should return early and not track anything', async () => {
      await trackNewUserJourney(mockContext);

      expect(mockWriteToGlobalState).not.toHaveBeenCalled();
      expect(mockShowInformationMessage).not.toHaveBeenCalled();
      expect(
        mockTelemetryService.reportCommandsInserted,
      ).not.toHaveBeenCalled();
    });
  });

  describe('when user is new and has not seen milestone notification', () => {
    beforeEach(() => {
      // Mock isFreshInstall to return true (fresh install)
      mockIsFreshInstall.mockReturnValue(true);

      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return false;
        if (key === 'COMMAND_USAGE_COUNT') return 5;
        return undefined;
      });
    });

    it('should increment command usage count', async () => {
      await trackNewUserJourney(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        6,
      );
    });

    it('should handle undefined command usage count as 0', async () => {
      mockReadFromGlobalState.mockImplementation((context, key) => {
        if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
          return false;
        if (key === 'COMMAND_USAGE_COUNT') return undefined;
        return undefined;
      });

      await trackNewUserJourney(mockContext);

      expect(mockWriteToGlobalState).toHaveBeenCalledWith(
        mockContext,
        'COMMAND_USAGE_COUNT',
        1,
      );
    });

    it('should not show notification when count is less than 10', async () => {
      await trackNewUserJourney(mockContext);

      expect(mockShowInformationMessage).not.toHaveBeenCalled();
      expect(
        mockTelemetryService.reportCommandsInserted,
      ).not.toHaveBeenCalled();
    });

    describe('when reaching 10 command milestone', () => {
      beforeEach(() => {
        mockReadFromGlobalState.mockImplementation((context, key) => {
          if (key === 'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION')
            return false;
          if (key === 'COMMAND_USAGE_COUNT') return 9; // Will become 10 after increment
          return undefined;
        });
      });

      // it('should show newsletter notification with correct message', async () => {
      //   mockShowInformationMessage.mockResolvedValue(undefined);

      //   await trackNewUserJourney(mockContext);

      //   expect(mockShowInformationMessage).toHaveBeenCalledWith(
      //     "🎉 Great job! You've used Turbo 10 times. Join our newsletter for exclusive surveys, tips, updates!",
      //     'Join Newsletter',
      //     'Maybe Later',
      //   );
      // });

      // it('should open external link when user clicks Join Newsletter', async () => {
      //   // Mock the notification to simulate clicking "Join Newsletter"
      //   (mockShowInformationMessage as jest.Mock).mockResolvedValue(
      //     'Join Newsletter',
      //   );

      //   await trackNewUserJourney(mockContext);

      //   expect(mockUriParse).toHaveBeenCalledWith(
      //     'https://www.turboconsolelog.io/join',
      //   );
      //   expect(mockOpenExternal).toHaveBeenCalledWith(
      //     'https://www.turboconsolelog.io/join',
      //   );
      // });

      it('should not open external link when user clicks Maybe Later', async () => {
        // Mock the notification to simulate clicking "Maybe Later"
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(
          'Maybe Later',
        );

        await trackNewUserJourney(mockContext);

        expect(mockOpenExternal).not.toHaveBeenCalled();
      });

      it('should mark notification as shown', async () => {
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

        await trackNewUserJourney(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should mark notification as shown', async () => {
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

        await trackNewUserJourney(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenCalledWith(
          mockContext,
          'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
          true,
        );
      });

      it('should send telemetry event', async () => {
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

        await trackNewUserJourney(mockContext);

        expect(mockCreateTelemetryService).toHaveBeenCalled();
        expect(
          mockTelemetryService.reportCommandsInserted,
        ).toHaveBeenCalledWith(mockContext, 10);
      });

      it('should handle telemetry errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const telemetryError = new Error('Telemetry failed');
        mockTelemetryService.reportCommandsInserted.mockRejectedValue(
          telemetryError,
        );
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

        await expect(trackNewUserJourney(mockContext)).resolves.not.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(
          '[Turbo Console Log] Failed to send commands inserted analytics:',
          telemetryError,
        );

        consoleSpy.mockRestore();
      });

      it('should call writeToGlobalState in correct order', async () => {
        (mockShowInformationMessage as jest.Mock).mockResolvedValue(undefined);

        await trackNewUserJourney(mockContext);

        expect(mockWriteToGlobalState).toHaveBeenNthCalledWith(
          1,
          mockContext,
          'COMMAND_USAGE_COUNT',
          10,
        );
        expect(mockWriteToGlobalState).toHaveBeenNthCalledWith(
          2,
          mockContext,
          'HAS_SHOWN_TEN_COMMANDS_MILESTONE_NOTIFICATION',
          true,
        );
      });
    });
  });
});
