import { TextDocument, TextEditorEdit } from 'vscode';
import { ExtensionProperties } from '@/entities';
import { insertDebugMessage } from '@/debug-message/js/JSDebugMessage/msg/insertDebugMessage/insertDebugMessage';
import { addFileInfo } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addFileInfo/addFileInfo';
import { addPrefix } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addPrefix/addPrefix';
import { addVariable } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/addVariable/addVariable';
import { getFileName } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/getFileName/getFileName';
import { selectQuote } from '@/debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent/helpers/selectQuote/selectQuote';

function getIndentation(text: string): string {
  const firstNonWhitespace = text.search(/\S|$/);
  return text.slice(0, firstNonWhitespace === -1 ? text.length : firstNonWhitespace);
}

function getIndentUnit(tabSize: number): string {
  return Number.isInteger(tabSize) ? ' '.repeat(tabSize) : '  ';
}

function getSpacesBeforeMessage(
  document: TextDocument,
  selectedVarLine: number,
  insertionLine: number,
  tabSize: number,
): string {
  const selectedLineText = document.lineAt(selectedVarLine).text;
  const selectedLineIndentation = getIndentation(selectedLineText);

  if (insertionLine < document.lineCount) {
    const nextLineText = document.lineAt(insertionLine).text;
    if (nextLineText.trim().length > 0) {
      return getIndentation(nextLineText);
    }
  }

  if (selectedLineText.trimEnd().endsWith(':')) {
    return `${selectedLineIndentation}${getIndentUnit(tabSize)}`;
  }

  return selectedLineIndentation;
}

function buildMessageContent(
  document: TextDocument,
  selectedVar: string,
  insertionLine: number,
  extensionProperties: ExtensionProperties,
): string {
  const parts: string[] = [];
  const fileName = getFileName(document.fileName);
  const actualLineNum =
    insertionLine + (extensionProperties.insertEmptyLineBeforeLogMessage ? 2 : 1);

  parts.push(
    ...addPrefix(
      extensionProperties.logMessagePrefix,
      extensionProperties.delimiterInsideMessage,
    ),
  );
  parts.push(
    ...addFileInfo(
      fileName,
      actualLineNum,
      extensionProperties.includeFilename,
      extensionProperties.includeLineNum,
      extensionProperties.delimiterInsideMessage,
    ),
  );
  parts.push(...addVariable(selectedVar, extensionProperties.logMessageSuffix));

  return parts.join('');
}

function buildPythonCall(
  message: string,
  selectedVar: string | null,
  logFunction: string,
  extensionProperties: ExtensionProperties,
): string {
  const quote = selectQuote(
    extensionProperties.quote,
    selectedVar ?? extensionProperties.logMessagePrefix,
  );
  const semicolon = extensionProperties.addSemicolonInTheEnd ? ';' : '';

  if (selectedVar === null) {
    return `${logFunction}(${quote}${message}${quote})${semicolon}`;
  }

  if (logFunction === 'print') {
    return `print(${quote}${message}${quote}, ${selectedVar})${semicolon}`;
  }

  if (logFunction.startsWith('logging.')) {
    return `${logFunction}(${quote}${message} %s${quote}, ${selectedVar})${semicolon}`;
  }

  return `${logFunction}(${quote}${message}${quote}, ${selectedVar})${semicolon}`;
}

export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  tabSize: number,
  extensionProperties: ExtensionProperties,
  logFunction: string,
): void {
  const insertionLine = Math.min(lineOfSelectedVar + 1, document.lineCount);
  const spacesBeforeMsg = getSpacesBeforeMessage(
    document,
    lineOfSelectedVar,
    insertionLine,
    tabSize,
  );
  const message = buildMessageContent(
    document,
    selectedVar,
    insertionLine,
    extensionProperties,
  );
  const debuggingMsg = `${spacesBeforeMsg}${buildPythonCall(
    message,
    selectedVar,
    logFunction,
    extensionProperties,
  )}`;

  if (extensionProperties.wrapLogMessage) {
    const wrapperText = `${extensionProperties.logMessagePrefix} ${'-'.repeat(
      Math.max(message.length - 16, 4),
    )}${extensionProperties.logMessagePrefix}`;
    const wrapper = `${spacesBeforeMsg}${buildPythonCall(
      wrapperText,
      null,
      logFunction,
      {
        ...extensionProperties,
        addSemicolonInTheEnd: false,
      },
    )}`;

    insertDebugMessage(
      document,
      textEditor,
      insertionLine,
      `${wrapper}\n${debuggingMsg}\n${wrapper}`,
      extensionProperties.insertEmptyLineBeforeLogMessage,
      extensionProperties.insertEmptyLineAfterLogMessage,
    );
    return;
  }

  insertDebugMessage(
    document,
    textEditor,
    insertionLine,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );
}