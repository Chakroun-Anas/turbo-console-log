import { getFileName } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/getFileName';

describe('PHP getFileName', () => {
  it('should extract filename from Unix path', () => {
    const result = getFileName('/home/user/projects/app/src/index.php');
    expect(result).toBe('index.php');
  });

  it('should extract filename from Windows path', () => {
    const result = getFileName('C:\\Users\\Dev\\project\\file.php');
    expect(result).toBe('file.php');
  });

  it('should handle mixed separators', () => {
    const result = getFileName('/var/www\\html/script.php');
    expect(result).toBe('script.php');
  });

  it('should return filename when no path separators', () => {
    const result = getFileName('standalone.php');
    expect(result).toBe('standalone.php');
  });

  it('should handle empty string', () => {
    const result = getFileName('');
    expect(result).toBe('');
  });

  it('should handle path ending with separator', () => {
    const result = getFileName('/path/to/directory/');
    expect(result).toBe('');
  });

  it('should extract filename with multiple dots', () => {
    const result = getFileName('/app/config.production.php');
    expect(result).toBe('config.production.php');
  });
});
