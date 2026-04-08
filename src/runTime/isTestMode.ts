/**
 * Check if the extension is running in test mode
 * Test mode is enabled by setting TURBO_RUN_MODE=test environment variable
 * in the launch configuration
 *
 * In test mode:
 * - Notification thresholds are bypassed
 * - Cooldown periods are ignored
 * - Global state checks can be skipped
 *
 * Usage in launch.json:
 * ```json
 * {
 *   "name": "Extension - Test Mode",
 *   "env": {
 *     "TURBO_RUN_MODE": "test"
 *   }
 * }
 * ```
 */
export function isTestMode(): boolean {
  return process.env.TURBO_RUN_MODE === 'test';
}

/**
 * Get the current run mode
 * @returns 'test' | 'production' | undefined
 */
export function getRunMode(): string | undefined {
  return process.env.TURBO_RUN_MODE;
}
