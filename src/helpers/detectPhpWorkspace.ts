import * as vscode from 'vscode';
import { readFromGlobalState, writeToGlobalState } from './index';
import { GlobalStateKey } from '@/entities';

/**
 * Detects if the current workspace is a PHP project and schedules a notification
 * announcing upcoming PHP support for next activation (one-time only)
 *
 * Detection criteria:
 * - Presence of .php files in the workspace
 * - Presence of composer.json (PHP dependency manager)
 * - PHP-specific folders (vendor/, public/index.php, etc.)
 *
 * @param context VS Code extension context
 */
export async function detectPhpWorkspace(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Check if notification has already been shown
  const hasShownNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
  );

  if (hasShownNotification) {
    return; // Already shown, skip
  }

  // Check if there are workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return; // No workspace open
  }

  try {
    // Look for PHP indicators
    const isPhpWorkspace = await detectPhpFiles();

    if (isPhpWorkspace) {
      // Mark as shown immediately to avoid duplicate notifications
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_PHP_WORKSPACE_NOTIFICATION,
        true,
      );

      // Schedule notification for next activation (delayed notification strategy)
      writeToGlobalState(
        context,
        GlobalStateKey.PENDING_PHP_WORKSPACE_NOTIFICATION,
        true,
      );
    }
  } catch (error) {
    // Silently fail - workspace detection should never break the extension
    console.warn('[Turbo Console Log] Failed to detect PHP workspace:', error);
  }
}

/**
 * Detects PHP files in the workspace using a single optimized search
 * Combines multiple PHP indicators into one glob pattern
 * Returns true if PHP project indicators are found
 */
async function detectPhpFiles(): Promise<boolean> {
  try {
    // Single search combining all PHP indicators:
    // - composer.json (PHP dependency manager - strongest indicator)
    // - .php files (any PHP source code)
    // - artisan (Laravel framework CLI)
    // - wp-config.php (WordPress configuration)
    const findFilesPromise = vscode.workspace.findFiles(
      '{**/composer.json,**/*.php,**/artisan,**/wp-config.php}',
      '**/node_modules/**',
      1, // Stop at first match for performance
    );

    // Timeout after 5 seconds to prevent blocking activation
    const timeoutPromise = new Promise<vscode.Uri[]>((resolve) => {
      setTimeout(() => resolve([]), 5000);
    });

    const phpIndicators = await Promise.race([
      findFilesPromise,
      timeoutPromise,
    ]);

    return phpIndicators.length > 0;
  } catch (error) {
    console.warn('[Turbo Console Log] Error during PHP file detection:', error);
    return false;
  }
}
