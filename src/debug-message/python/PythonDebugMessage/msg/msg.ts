import { window, Position } from 'vscode';
import type { TextEditorEdit, TextDocument } from 'vscode';
import type { ExtensionProperties } from '@/entities';
import { parseCode } from './python-parser-utils/parseCode';
import { logMessage } from './logMessage/logMessage';
import { line as logMessageLine } from './logMessageLine/logMessageLine';
import { spacesBeforeLogMsg } from './spacesBeforeLogMsg/spacesBeforeLogMsg';
import { constructDebuggingMsgContent } from './constructDebuggingMsgContent/constructDebuggingMsgContent';
import { constructDebuggingMsg } from './constructDebuggingMsg/constructDebuggingMsg';
import { insertDebugMessage } from '@/debug-message/js/JSDebugMessage/msg/insertDebugMessage/insertDebugMessage';
import {
  isLoggingModuleImported,
  loggingImportInsertLine,
} from './loggingImport/loggingImport';

export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  _tabSize: number,
  extensionProperties: ExtensionProperties,
  logFunction: string,
): void {
  let program;
  try {
    program = parseCode(document);
  } catch (error) {
    window.showErrorMessage(
      `Turbo AST: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return;
  }

  const logMsg = logMessage(program, document, lineOfSelectedVar, selectedVar);
  const lineOfLogMsg = logMessageLine(
    program,
    document,
    selectedVar,
    lineOfSelectedVar,
    logMsg,
  );
  const spacesBeforeMsg = spacesBeforeLogMsg(
    program,
    document,
    lineOfSelectedVar,
    lineOfLogMsg,
  );
  const debuggingMsgContent = constructDebuggingMsgContent(
    program,
    document,
    selectedVar,
    lineOfSelectedVar,
    lineOfLogMsg,
    extensionProperties,
    logFunction,
  );
  const debuggingMsg = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
    logFunction,
  );

  insertDebugMessage(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );

  // `logging.*` functions need the module imported (`print` is a builtin). Add
  // `import logging` idempotently, in this same edit so VS Code resolves both
  // insert offsets against the original document.
  if (
    logFunction.startsWith('logging.') &&
    !isLoggingModuleImported(program, document)
  ) {
    const importLine = loggingImportInsertLine(program, document);
    const atEnd = importLine >= document.lineCount;
    textEditor.insert(
      new Position(atEnd ? document.lineCount : importLine, 0),
      `${atEnd ? '\n' : ''}import logging\n`,
    );
  }
}
