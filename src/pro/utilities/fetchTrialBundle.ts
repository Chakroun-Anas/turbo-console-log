import { isTestMode } from '@/runTime';
import { generateDeveloperId } from '@/helpers/generateDeveloperId';
import axios from 'axios';

const TURBO_WEBSITE_BASE_URL = isTestMode()
  ? 'http://localhost:3000'
  : 'https://www.turboconsolelog.io';

export async function fetchTrialBundle(
  trialKey: string,
  proVersion: string,
): Promise<{ bundle: string; expiresAt: Date }> {
  const developerId = generateDeveloperId();

  const response = await axios.get(
    `${TURBO_WEBSITE_BASE_URL}/api/validateTrial`,
    {
      params: {
        trialKey,
        developerId,
        targetVersion: proVersion,
      },
    },
  );

  return {
    bundle: response.data.turboProBundle,
    expiresAt: new Date(response.data.expiresAt),
  };
}
