import axios from 'axios';

export interface CustomReleaseMessage {
  message: string;
  ctaText: string;
  ctaUrl: string;
  countryFlag?: string;
}

const TURBO_WEBSITE_BASE_URL = 'https://www.turboconsolelog.io';
// const TURBO_WEBSITE_BASE_URL = 'http://localhost:3000';

/**
 * Fetches custom release message from the website API
 * @param version Release version (e.g., "v3.6.0")
 * @returns Promise with custom release message or null if failed
 */
export async function fetchCustomReleaseMessage(
  version: string,
): Promise<CustomReleaseMessage | null> {
  try {
    const response = await axios.get<CustomReleaseMessage>(
      `${TURBO_WEBSITE_BASE_URL}/api/customReleaseMessage`,
      {
        params: { version },
        timeout: 10000, // 5 second timeout
      },
    );
    return response.data;
  } catch (error) {
    console.warn(
      '[Turbo Console Log] Failed to fetch custom release message:',
      error,
    );
    return null;
  }
}
