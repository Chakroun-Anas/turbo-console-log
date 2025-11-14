import * as vscode from 'vscode';
import { DebugMessage } from '@/debug-message';

/**
 * Dynamically loads PHP debug message from Pro bundle
 * @param context VS Code extension context
 * @returns PHP debug message instance or null if unavailable
 */
export async function loadPhpDebugMessage(
  context: vscode.ExtensionContext,
): Promise<DebugMessage | null> {
  try {
    const proBundle = context.globalState.get<string>('pro-bundle');
    if (!proBundle) {
      return null;
    }

    // Create the same exports structure as in runProBundle
    const exports: Record<string, unknown> = {};
    const module = { exports };

    // Import php-parser dynamically
    const phpParserModule = await import('php-parser');
    const phpParser = phpParserModule.default || phpParserModule;

    // Execute the Pro bundle to get the exports
    const turboConsoleLogProFactory = new Function(
      'exports',
      'module',
      'vscode',
      'phpParser',
      proBundle,
    );

    turboConsoleLogProFactory(exports, module, vscode, phpParser);

    // Extract createPhpDebugMessage from exports
    const createPhpDebugMessage =
      exports.createPhpDebugMessage || module.exports?.createPhpDebugMessage;

    if (typeof createPhpDebugMessage !== 'function') {
      console.error('createPhpDebugMessage not found in Pro bundle exports');
      return null;
    }

    // Create and return the PHP debug message
    const phpDebugMessage = createPhpDebugMessage(vscode, phpParser);
    return phpDebugMessage;
  } catch (error) {
    console.error('Error loading PHP debug message from Pro bundle:', error);
    return null;
  }
}
