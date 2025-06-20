import axios from 'axios';

export async function fetchProBundle(
  licenseKey: string,
  proVersion: string,
): Promise<string> {
  const response = await axios.get(
    'https://www.turboconsolelog.io/api/activateTurboProBundle',
    {
      params: {
        licenseKey,
        targetVersion: proVersion,
      },
    },
  );
  return response.data.turboProBundle;
}
