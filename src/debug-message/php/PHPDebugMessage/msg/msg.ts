import type { TextEditorEdit, TextDocument } from 'vscode';
import { ExtensionProperties } from '@/entities';
import { parseCode } from './php-parser-utils';
import { logMessage } from './logMessage';
import { type PHPLogMessage } from './logMessage/phpLogMessageTypes';
import { line as logMessageLine } from './logMessageLine';
import { spacesBeforeLogMsg } from './spacesBeforeLogMsg';
import { constructDebuggingMsg } from './constructDebuggingMsg';
import { constructDebuggingMsgContent } from './constructDebuggingMsgContent';
import { insertDebugMessage } from './insertDebugMessage';
import {
  needTransformation,
  performTransformation,
  applyTransformedCode,
} from './transformer';

/**
 * Main function to generate and insert PHP debugging messages into the document.
 * This function orchestrates the entire process of creating a debug log message
 * based on the selected variable and extension configuration for PHP files.
 *
 * @param textEditor The text editor instance for making edits
 * @param document The text document being edited
 * @param selectedVar The selected variable name to debug (e.g., $user, $data['key'])
 * @param lineOfSelectedVar The line number where the variable is located
 * @param tabSize The tab size setting for proper indentation
 * @param extensionProperties Configuration properties for the extension
 * @param logFunction The PHP logging function to use (error_log, var_dump, print_r)
 * @param vscodeModule Optional injected vscode module (for Pro bundle context)
 * @param phpParser Optional injected php-parser module (for Pro bundle context)
 */
export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  tabSize: number,
  extensionProperties: ExtensionProperties,
  logFunction: string,
  vscodeModule?: typeof import('vscode'),
  phpParser?: unknown,
): void {
  // Parse the code once and reuse the AST throughout the process
  const code = document.getText();

  let ast;

  try {
    ast = parseCode(code, phpParser);
  } catch (error) {
    console.error('[TCL PHP Debug] parseCode failed:', error);
    console.error(
      '[TCL PHP Debug] Error stack:',
      error instanceof Error ? error.stack : 'No stack',
    );
    // Show error notification to the user if vscode is available
    if (vscodeModule) {
      vscodeModule.window.showErrorMessage(
        `Turbo AST: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
    return;
  }

  // 2. Detect the log message context
  const logMsg: PHPLogMessage = logMessage(
    ast,
    document,
    lineOfSelectedVar,
    selectedVar,
  );

  // 3. Calculate the line where log should be inserted
  const lineOfLogMsg = logMessageLine(
    ast,
    document,
    selectedVar,
    lineOfSelectedVar,
    logMsg,
  );

  // 4. Calculate indentation
  const spacesBeforeMsg = spacesBeforeLogMsg(
    document,
    lineOfSelectedVar,
    lineOfLogMsg,
  );

  // 5. Construct the debugging message content (passing AST for context extraction)
  const debuggingMsgContent = constructDebuggingMsgContent(
    ast,
    document,
    selectedVar,
    lineOfSelectedVar,
    lineOfLogMsg,
    extensionProperties,
    logFunction,
  );

  // 6. Construct the final debugging message with wrapping if enabled
  const debuggingMsg = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
    logFunction,
  );

  // Check if transformation is needed (arrow functions, empty functions/methods)
  if (needTransformation(ast, document, lineOfSelectedVar, selectedVar)) {
    const transformedCode = performTransformation(
      ast,
      document,
      lineOfSelectedVar,
      selectedVar,
      debuggingMsg,
      { tabSize },
    );
    if (vscodeModule) {
      applyTransformedCode(vscodeModule, document, transformedCode);
    }
    return;
  }

  // 7. Insert the debug message into the document
  insertDebugMessage(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
    vscodeModule!,
  );
}
