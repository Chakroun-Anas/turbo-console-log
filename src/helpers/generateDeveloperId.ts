import * as vscode from 'vscode';
import * as crypto from 'crypto';

/**
 * Generate a stable, anonymous developer identifier
 * Uses machine-specific identifiers that remain consistent across sessions
 * Used for notification deduplication and analytics
 *
 * IMPORTANT: This implementation must remain backward compatible.
 * Changing the generation logic will create different IDs for existing users,
 * breaking analytics continuity and notification deduplication.
 */
export function generateDeveloperId(): string {
  try {
    // Use stable identifiers that don't change between VS Code sessions
    const machineId = vscode.env.machineId || 'unknown-machine';
    const language = vscode.env.language || 'unknown-language';
    const platform = process.platform || 'unknown-platform';
    const arch = process.arch || 'unknown-arch';

    // Create a stable identifier combining machine-specific data
    const combined = [
      machineId,
      language,
      platform,
      arch,
      'turbo-console-log-stable', // Extension-specific salt
    ].join('-');

    // Use crypto for a proper hash if available, fallback to simple hash
    let developerId: string;

    if (crypto && crypto.createHash) {
      // Use SHA256 for better distribution and collision resistance
      developerId = crypto
        .createHash('sha256')
        .update(combined)
        .digest('hex')
        .substring(0, 16); // Use first 16 characters for reasonable length
    } else {
      // Fallback for environments where crypto is not available
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      developerId = Math.abs(hash).toString(36);
    }

    return `dev_${developerId}`;
  } catch {
    // Ultimate fallback - use machineId directly if available
    const machineId = vscode.env.machineId;
    if (machineId && machineId !== 'unknown-machine') {
      return `dev_machine_${machineId.substring(0, 16)}`;
    }

    // Last resort fallback - use timestamp + random for uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `dev_fallback_${timestamp}_${random}`;
  }
}
