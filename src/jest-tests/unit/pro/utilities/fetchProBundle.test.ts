import axios from 'axios';
import { fetchProBundle } from '../../../../pro/utilities';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchProBundle', () => {
  it('should fetch and return the turboProBundle string', async () => {
    const mockResponse = {
      data: {
        turboProBundle: 'mocked-bundle-code-here',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await fetchProBundle('test-license', '1.2.3');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.turboconsolelog.io/api/activateTurboProBundle',
      {
        params: {
          licenseKey: 'test-license',
          targetVersion: '1.2.3',
        },
      },
    );
    expect(result).toBe('mocked-bundle-code-here');
  });
});
