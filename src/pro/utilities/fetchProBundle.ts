import { isTestMode } from '@/runTime';
import axios from 'axios';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

export async function fetchProBundle(
  licenseKey: string,
  proVersion: string,
): Promise<string> {
  const response = await axios.get(
    `${TURBO_WEBSITE_BASE_URL}/api/activateTurboProBundle`,
    {
      params: {
        licenseKey,
        targetVersion: proVersion,
      },
    },
  );
  return response.data.turboProBundle;
}
