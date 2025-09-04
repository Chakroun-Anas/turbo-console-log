import axios from 'axios';
import { fetchCustomReleaseMessage } from '@/utilities/fetchCustomReleaseMessage';

jest.mock('axios');

describe('fetchCustomReleaseMessage', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('successfully fetches custom release message', async () => {
    const mockResponse = {
      data: {
        message: '🚀 Test message with flag 🇺🇸',
        ctaText: 'Get Pro Now',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
        countryFlag: '🇺🇸',
        countryCode: 'US',
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchCustomReleaseMessage('v3.6.0');

    expect(result).toEqual(mockResponse.data);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.turboconsolelog.io/api/customReleaseMessage',
      {
        params: { version: 'v3.6.0' },
        timeout: 10000,
      },
    );
  });

  it('returns null when API request fails', async () => {
    const error = new Error('Network error');
    mockedAxios.get.mockRejectedValue(error);

    const result = await fetchCustomReleaseMessage('v3.6.0');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      '[Turbo Console Log] Failed to fetch custom release message:',
      error,
    );
  });

  it('returns null when API times out', async () => {
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded',
    };
    mockedAxios.get.mockRejectedValue(error);

    const result = await fetchCustomReleaseMessage('v3.6.0');

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      '[Turbo Console Log] Failed to fetch custom release message:',
      error,
    );
  });

  it('calls API with correct parameters for different versions', async () => {
    const mockResponse = {
      data: {
        message: 'Test message',
        ctaText: 'Get Pro',
        ctaUrl: 'https://www.turboconsolelog.io/pro',
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    await fetchCustomReleaseMessage('v3.7.0');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.turboconsolelog.io/api/customReleaseMessage',
      {
        params: { version: 'v3.7.0' },
        timeout: 10000,
      },
    );
  });
});
