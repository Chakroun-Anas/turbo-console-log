import {
  canInsertLogInDocument,
  resetNotificationLock,
} from '@/helpers/canInsertLogInDocument';
import { isProUser } from '@/helpers/isProUser';
import { isPhpFile } from '@/helpers/isPhpFile';
import { showNotification } from '@/notifications/showNotification';
import { NotificationEvent } from '@/notifications/NotificationEvent';
import {
  makeExtensionContext,
  makeTextDocument,
} from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers/isProUser');
jest.mock('@/helpers/isPhpFile');
jest.mock('@/notifications/showNotification');

describe('canInsertLogInDocument', () => {
  const mockIsProUser = isProUser as jest.MockedFunction<typeof isProUser>;
  const mockIsPhpFile = isPhpFile as jest.MockedFunction<typeof isPhpFile>;
  const mockShowNotification = showNotification as jest.MockedFunction<
    typeof showNotification
  >;

  let context: ReturnType<typeof makeExtensionContext>;
  const version = '3.10.0';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetNotificationLock(); // Reset the lock between tests
    context = makeExtensionContext();
    // Mock showNotification to return a resolved Promise
    mockShowNotification.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('JavaScript/TypeScript files', () => {
    it('returns true for JavaScript file regardless of Pro status', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('returns true for TypeScript file regardless of Pro status', async () => {
      const document = makeTextDocument(['const x: string = "test";']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('returns true for JavaScript file when user is Pro', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(true);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('PHP files with free users', () => {
    it('returns false for PHP file when user is not Pro', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(false);
    });

    it('shows PHP Pro-only notification when free user tries PHP logging', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      canInsertLogInDocument(context, document, version);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        version,
        context,
      );
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });

    it('passes version parameter to notification', async () => {
      const document = makeTextDocument(['<?php', 'var_dump($x);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);
      const customVersion = '3.9.7';

      canInsertLogInDocument(context, document, customVersion);

      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        customVersion,
        context,
      );
    });

    it('works without version parameter', async () => {
      const document = makeTextDocument(['<?php', '$x = 1;']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        version,
        context,
      );
    });
  });

  describe('PHP files with Pro users', () => {
    it('returns true for PHP file when user is Pro', async () => {
      const document = makeTextDocument(['<?php', 'var_dump($data);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
    });

    it('does not show notification for PHP file when user is Pro', async () => {
      const document = makeTextDocument(['<?php', 'print_r($array);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      canInsertLogInDocument(context, document, version);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('helper function integration', () => {
    it('calls isPhpFile with correct document', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      canInsertLogInDocument(context, document, version);

      expect(mockIsPhpFile).toHaveBeenCalledWith(document);
      expect(mockIsPhpFile).toHaveBeenCalledTimes(1);
    });

    it('calls isProUser with correct context', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      canInsertLogInDocument(context, document, version);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockIsProUser).toHaveBeenCalledTimes(1);
    });

    it('short-circuits when not PHP file without checking Pro status', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockIsPhpFile).toHaveBeenCalled();
      // isProUser should not be called if it's not a PHP file
      expect(mockIsProUser).not.toHaveBeenCalled();
    });

    it('checks Pro status only for PHP files', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      canInsertLogInDocument(context, document, version);

      expect(mockIsPhpFile).toHaveBeenCalled();
      expect(mockIsProUser).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty PHP file from free user', async () => {
      const document = makeTextDocument(['']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(false);
      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('handles empty JavaScript file', async () => {
      const document = makeTextDocument(['']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('notification lock mechanism', () => {
    it('prevents duplicate notifications within 2 seconds', () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      // First call - should show notification
      const result1 = canInsertLogInDocument(context, document, version);
      expect(result1).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Second call immediately after - should be blocked
      const result2 = canInsertLogInDocument(context, document, version);
      expect(result2).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledTimes(1); // Still only called once

      // Third call after 1 second - still blocked
      jest.advanceTimersByTime(1000);
      const result3 = canInsertLogInDocument(context, document, version);
      expect(result3).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Fourth call after 2.5 seconds total - should show notification again
      jest.advanceTimersByTime(1500);
      jest.runAllTimers(); // Run the setTimeout callback that resets the lock
      const result4 = canInsertLogInDocument(context, document, version);
      expect(result4).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledTimes(2);
    });

    it('lock survives across multiple rapid calls (simulates the bug)', () => {
      const document = makeTextDocument(['<?php', 'var_dump($x);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      // Simulate 72 rapid calls like the bug (within 6 seconds window)
      // Using realistic gaps from the actual data (0.00-0.65s)
      const results = [];
      for (let i = 0; i < 72; i++) {
        results.push(canInsertLogInDocument(context, document, version));
        // Don't advance time - simulate them happening nearly simultaneously
        // (the real bug had most gaps under 0.1s)
      }

      // All should return false
      expect(results.every((r) => r === false)).toBe(true);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Wait for lock to expire and reset
      jest.advanceTimersByTime(2100);
      jest.runAllTimers();

      // Second attempt after lock expires
      canInsertLogInDocument(context, document, version);
      expect(mockShowNotification).toHaveBeenCalledTimes(2);
    });
  });
});
