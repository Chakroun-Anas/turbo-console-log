import { addPrefix } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addPrefix';
import { resolveDelimiterSpacing } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing';

// Mock the resolveDelimiterSpacing function
jest.mock('@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing');

describe('addPrefix', () => {
  const mockResolveDelimiterSpacing = resolveDelimiterSpacing as jest.MockedFunction<typeof resolveDelimiterSpacing>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveDelimiterSpacing.mockReturnValue(' : ');
  });

  it('should return array with prefix and delimiter spacing when prefix has content', () => {
    const prefix = 'DEBUG';
    const delimiter = ':';
    mockResolveDelimiterSpacing.mockReturnValue(' : ');

    const result = addPrefix(prefix, delimiter);

    expect(result).toEqual(['DEBUG', ' : ']);
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith(prefix, delimiter);
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when prefix is empty', () => {
    const result = addPrefix('', ':');

    expect(result).toEqual([]);
    expect(mockResolveDelimiterSpacing).not.toHaveBeenCalled();
  });

  it('should handle different delimiter spacing results from resolveDelimiterSpacing', () => {
    // Test when resolveDelimiterSpacing returns just a space (avoiding duplication)
    mockResolveDelimiterSpacing.mockReturnValue(' ');
    let result = addPrefix('LOG: ', ':');
    expect(result).toEqual(['LOG: ', ' ']);

    // Test when resolveDelimiterSpacing returns empty string
    mockResolveDelimiterSpacing.mockReturnValue('');
    result = addPrefix('PREFIX', '');
    expect(result).toEqual(['PREFIX', '']);
  });

  it('should work with complex prefixes and delimiters', () => {
    const prefix = '[ERROR] Component';
    const delimiter = ' -> ';
    mockResolveDelimiterSpacing.mockReturnValue(' -> ');

    const result = addPrefix(prefix, delimiter);

    expect(result).toEqual(['[ERROR] Component', ' -> ']);
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith(prefix, delimiter);
  });

  it('should pass the exact arguments to resolveDelimiterSpacing', () => {
    addPrefix('TEST_PREFIX', '::');

    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('TEST_PREFIX', '::');
  });
});
