import * as dns from 'dns';

/**
 * Check internet connectivity
 * @returns internet connection status - Promise<boolean>
 */
export function isOnline(): Promise<boolean> {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err);
    });
  });
}
