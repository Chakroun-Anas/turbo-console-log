import { addFileInfo } from '@/debug-message/php/PHPDebugMessage/msg/constructDebuggingMsgContent/helpers/addFileInfo';

describe('PHP addFileInfo', () => {
  it('should add filename and line number when both are enabled', () => {
    const result = addFileInfo('script.php', 42, true, true, ':');
    expect(result).toEqual(['script.php:42', ' : ']);
  });

  it('should add only filename when line number is disabled', () => {
    const result = addFileInfo('index.php', 10, true, false, ':');
    expect(result).toEqual(['index.php', ' : ']);
  });

  it('should add only line number when filename is disabled', () => {
    const result = addFileInfo('app.php', 25, false, true, ':');
    expect(result).toEqual([':25', ' : ']);
  });

  it('should return empty array when both are disabled', () => {
    const result = addFileInfo('file.php', 100, false, false, ':');
    expect(result).toEqual([]);
  });

  it('should handle different delimiters', () => {
    const result = addFileInfo('test.php', 5, true, true, '|');
    expect(result).toEqual(['test.php:5', ' | ']);
  });

  it('should handle zero line number', () => {
    const result = addFileInfo('config.php', 0, true, true, ':');
    expect(result).toEqual(['config.php:0', ' : ']);
  });

  it('should handle large line numbers', () => {
    const result = addFileInfo('large.php', 99999, true, true, ':');
    expect(result).toEqual(['large.php:99999', ' : ']);
  });

  it('should work with empty delimiter', () => {
    const result = addFileInfo('empty.php', 15, true, true, '');
    // resolveDelimiterSpacing adds spaces around even empty delimiters
    expect(result).toEqual(['empty.php:15', '  ']);
  });
});
