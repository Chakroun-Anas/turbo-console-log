import * as vscode from 'vscode';
import { NotificationEventHandler } from './notificationEventHandler';

/**
 * Master notification events listener that consolidates all file-opening-based notifications
 *
 * Instead of registering 11+ separate onDidChangeActiveTextEditor listeners,
 * this creates a single unified listener that:
 * - Filters out handlers that shouldn't be registered (Pro users, already shown, etc.)
 * - Checks each remaining handler on every file switch
 * - Removes handlers once they've successfully shown their notification
 * - Automatically cleans up when no handlers remain
 *
 * Benefits:
 * - Single event handler instead of 11+ separate ones
 * - Reduced overhead when switching files
 * - Centralized disposal and cleanup logic
 * - Easier to debug and maintain
 *
 * @param context Extension context
 * @param version Extension version
 * @param handlers Array of notification event handlers to register
 */
export function listenToFileOpeningNotifications(
  context: vscode.ExtensionContext,
  version: string,
  handlers: NotificationEventHandler[],
): void {
  // Filter handlers: only register those that pass shouldRegister check
  const activeHandlers = handlers.filter((handler) => {
    try {
      return handler.shouldRegister(context);
    } catch (error) {
      console.error(
        `[Turbo Console Log] Error in shouldRegister for handler "${handler.id}":`,
        error,
      );
      return false; // Skip handler on error
    }
  });

  // If no handlers need to be registered, skip listener setup entirely
  if (activeHandlers.length === 0) {
    console.log(
      '[Turbo Console Log] No notification handlers to register, skipping master listener setup',
    );
    return;
  }

  console.log(
    `[Turbo Console Log] Registered ${activeHandlers.length} notification handlers:`,
    activeHandlers.map((h) => h.id).join(', '),
  );

  // Track which handlers are still active (not yet triggered)
  let remainingHandlers = [...activeHandlers];

  // Create the master listener
  const disposable = vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      // Skip if no editor or no handlers left
      if (!editor || remainingHandlers.length === 0) {
        return;
      }

      // Track which handlers to remove after this iteration
      const handlersToRemove: string[] = [];

      // Process each remaining handler
      for (const handler of remainingHandlers) {
        try {
          // Check if handler should process this editor
          const shouldProcess = await handler.shouldProcess(editor, context);

          if (!shouldProcess) {
            continue; // Skip to next handler
          }

          // Process the editor and check if notification was shown
          const wasShown = await handler.process(editor, context, version);

          if (wasShown) {
            // Handler completed successfully, mark for removal
            handlersToRemove.push(handler.id);
            console.log(
              `[Turbo Console Log] Handler "${handler.id}" completed, removing from active handlers`,
            );
          }
        } catch (error) {
          console.error(
            `[Turbo Console Log] Error in handler "${handler.id}":`,
            error,
          );
          // On error, remove handler to prevent repeated failures
          handlersToRemove.push(handler.id);
        }
      }

      // Remove completed/failed handlers
      if (handlersToRemove.length > 0) {
        remainingHandlers = remainingHandlers.filter(
          (h) => !handlersToRemove.includes(h.id),
        );

        // If no handlers remain, dispose the master listener entirely
        if (remainingHandlers.length === 0) {
          console.log(
            '[Turbo Console Log] All notification handlers completed, disposing master listener',
          );
          disposable.dispose();
        }
      }
    },
  );

  // Add to subscriptions for cleanup on deactivation
  context.subscriptions.push(disposable);
}
