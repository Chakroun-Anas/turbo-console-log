import { addPrefix } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addPrefix';
import { resolveDelimiterSpacing } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing';

// Mock the resolveDelimiterSpacing function
jest.mock(
  '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/resolveDelimiterSpacing',
);

describe('addPrefix', () => {
  const mockResolveDelimiterSpacing =
    resolveDelimiterSpacing as jest.MockedFunction<
      typeof resolveDelimiterSpacing
    >;

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
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith(delimiter);
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledTimes(1);
  });

  it('should work with complex prefixes and delimiters', () => {
    const prefix = '[ERROR] Component';
    const delimiter = '->';
    mockResolveDelimiterSpacing.mockReturnValue(' -> ');

    const result = addPrefix(prefix, delimiter);

    expect(result).toEqual(['[ERROR] Component', ' -> ']);
    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith(delimiter);
  });

  it('should pass the exact delimiter argument to resolveDelimiterSpacing', () => {
    addPrefix('TEST_PREFIX', '::');

    expect(mockResolveDelimiterSpacing).toHaveBeenCalledWith('::');
  });
});
