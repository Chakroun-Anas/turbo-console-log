import * as vscode from 'vscode';

/**
 * Represents a notification event handler that can be triggered by file openings
 */
export interface NotificationEventHandler {
  /**
   * Unique identifier for this handler (for logging/debugging)
   */
  id: string;

  /**
   * Early check to determine if this handler should even be considered
   * Called once during listener setup to potentially skip registering this handler
   * @returns true if handler should be registered, false to skip entirely
   */
  shouldRegister: (context: vscode.ExtensionContext) => boolean;

  /**
   * Check if this handler should process the currently active editor
   * Called every time a file is opened/switched
   * @param editor The active text editor
   * @param context Extension context
   * @returns true if this handler should process this editor, false to skip
   */
  shouldProcess: (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
  ) => boolean | Promise<boolean>;

  /**
   * Process the active editor and potentially show a notification
   * Only called if shouldProcess returns true
   * @param editor The active text editor
   * @param context Extension context
   * @param version Extension version
   * @returns true if notification was shown and handler should be disposed, false otherwise
   */
  process: (
    editor: vscode.TextEditor,
    context: vscode.ExtensionContext,
    version: string,
  ) => Promise<boolean>;
}
