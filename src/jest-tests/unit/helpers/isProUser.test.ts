import { isProUser } from '@/helpers/isProUser';
import { readFromGlobalState } from '@/helpers/readFromGlobalState';
import { makeExtensionContext } from '@/jest-tests/mocks/helpers';

jest.mock('@/helpers/readFromGlobalState');

describe('isProUser', () => {
  const mockReadFromGlobalState = readFromGlobalState as jest.MockedFunction<
    typeof readFromGlobalState
  >;

  let context: ReturnType<typeof makeExtensionContext>;

  beforeEach(() => {
    jest.clearAllMocks();
    context = makeExtensionContext();
  });

  it('returns true when both license key and pro bundle exist', () => {
    mockReadFromGlobalState.mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      return undefined;
    });

    const result = isProUser(context);

    expect(result).toBe(true);
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(
      context,
      'license-key',
    );
    expect(mockReadFromGlobalState).toHaveBeenCalledWith(context, 'pro-bundle');
  });

  it('returns false when license key is missing', () => {
    mockReadFromGlobalState.mockImplementation((_, key) => {
      if (key === 'license-key') return undefined;
      if (key === 'pro-bundle') return 'PRO_BUNDLE_CODE';
      return undefined;
    });

    const result = isProUser(context);

    expect(result).toBe(false);
  });

  it('returns false when pro bundle is missing', () => {
    mockReadFromGlobalState.mockImplementation((_, key) => {
      if (key === 'license-key') return 'LICENSE123';
      if (key === 'pro-bundle') return undefined;
      return undefined;
    });

    const result = isProUser(context);

    expect(result).toBe(false);
  });

  it('returns false when both license key and pro bundle are missing', () => {
    mockReadFromGlobalState.mockImplementation(() => undefined);

    const result = isProUser(context);

    expect(result).toBe(false);
  });
});
