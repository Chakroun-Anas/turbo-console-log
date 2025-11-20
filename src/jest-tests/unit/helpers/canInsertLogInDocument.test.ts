import { canInsertLogInDocument } from '@/helpers/canInsertLogInDocument';
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
    context = makeExtensionContext();
  });

  describe('JavaScript/TypeScript files', () => {
    it('returns true for JavaScript file regardless of Pro status', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('returns true for TypeScript file regardless of Pro status', async () => {
      const document = makeTextDocument(['const x: string = "test";']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('returns true for JavaScript file when user is Pro', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(true);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('PHP files with free users', () => {
    it('returns false for PHP file when user is not Pro', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(false);
    });

    it('shows PHP Pro-only notification when free user tries PHP logging', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      await canInsertLogInDocument(context, document, version);

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

      await canInsertLogInDocument(context, document, customVersion);

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

      const result = await canInsertLogInDocument(context, document);

      expect(result).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledWith(
        NotificationEvent.EXTENSION_PHP_PRO_ONLY,
        undefined,
        context,
      );
    });
  });

  describe('PHP files with Pro users', () => {
    it('returns true for PHP file when user is Pro', async () => {
      const document = makeTextDocument(['<?php', 'var_dump($data);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
    });

    it('does not show notification for PHP file when user is Pro', async () => {
      const document = makeTextDocument(['<?php', 'print_r($array);']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      await canInsertLogInDocument(context, document, version);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('helper function integration', () => {
    it('calls isPhpFile with correct document', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      await canInsertLogInDocument(context, document, version);

      expect(mockIsPhpFile).toHaveBeenCalledWith(document);
      expect(mockIsPhpFile).toHaveBeenCalledTimes(1);
    });

    it('calls isProUser with correct context', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      await canInsertLogInDocument(context, document, version);

      expect(mockIsProUser).toHaveBeenCalledWith(context);
      expect(mockIsProUser).toHaveBeenCalledTimes(1);
    });

    it('short-circuits when not PHP file without checking Pro status', async () => {
      const document = makeTextDocument(['console.log("test");']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockIsPhpFile).toHaveBeenCalled();
      // isProUser should not be called if it's not a PHP file
      expect(mockIsProUser).not.toHaveBeenCalled();
    });

    it('checks Pro status only for PHP files', async () => {
      const document = makeTextDocument(['<?php', 'echo "test";']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(true);

      await canInsertLogInDocument(context, document, version);

      expect(mockIsPhpFile).toHaveBeenCalled();
      expect(mockIsProUser).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty PHP file from free user', async () => {
      const document = makeTextDocument(['']);
      mockIsPhpFile.mockReturnValue(true);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(false);
      expect(mockShowNotification).toHaveBeenCalled();
    });

    it('handles empty JavaScript file', async () => {
      const document = makeTextDocument(['']);
      mockIsPhpFile.mockReturnValue(false);
      mockIsProUser.mockReturnValue(false);

      const result = await canInsertLogInDocument(context, document, version);

      expect(result).toBe(true);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });
});
