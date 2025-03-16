import { omit } from 'lodash';
import { TextEditorEdit, TextDocument, Position } from 'vscode';
import {
  ExtensionProperties,
  LogMessage,
  LogContextMetadata,
  LogMessageType,
} from '../../../../entities';
import { NamedFunctionMetadata } from '../../../../entities/extension/logMessage';
import { logMessage } from '../logMessage';
import { LineCodeProcessing } from '../../../../line-code-processing';
import { DebugMessageLine } from '../../../DebugMessageLine';
import { enclosingBlockName } from '../enclosingBlockName';
import {
  spacesBeforeLogMsg,
  isEmptyBlockContext,
  emptyBlockDebuggingMsg,
} from '../helpers';
import { JSDebugMessageAnonymous } from '../../JSDebugMessageAnonymous';

function hasFunctionBody(
  document: TextDocument,
  functionStartLine: number,
): boolean {
  let currentLineNum = functionStartLine;
  let totalOpenedBraces = 0;

  while (currentLineNum < document.lineCount) {
    const currentLineText = document.lineAt(currentLineNum).text.trim();

    // ✅ Count `{` and `}`
    totalOpenedBraces += (currentLineText.match(/{/g) || []).length;

    // ✅ If `{` exists → The function has a body
    if (totalOpenedBraces > 0) {
      return true;
    }

    currentLineNum++;

    // ✅ Stop early if we reach a new statement without finding `{`
    if (/^\S/.test(currentLineText) && totalOpenedBraces === 0) {
      return false;
    }
  }

  return false;
}

function constructDebuggingMsg(
  extensionProperties: ExtensionProperties,
  debuggingMsgContent: string,
  spacesBeforeMsg: string,
): string {
  const logFunction =
    extensionProperties.logFunction !== 'log'
      ? extensionProperties.logFunction
      : `console.${extensionProperties.logType}`;
  const wrappingMsg = `${logFunction}(${extensionProperties.quote}${
    extensionProperties.logMessagePrefix
  } ${'-'.repeat(debuggingMsgContent.length - 16)}${
    extensionProperties.logMessagePrefix
  }${extensionProperties.quote})${
    extensionProperties.addSemicolonInTheEnd ? ';' : ''
  }`;
  const debuggingMsg: string = extensionProperties.wrapLogMessage
    ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
    : `${spacesBeforeMsg}${debuggingMsgContent}`;
  return debuggingMsg;
}

function baseDebuggingMsg(
  document: TextDocument,
  textEditor: TextEditorEdit,
  lineOfLogMsg: number,
  debuggingMsg: string,
  insertEmptyLineBeforeLogMessage: ExtensionProperties['insertEmptyLineBeforeLogMessage'],
  insertEmptyLineAfterLogMessage: ExtensionProperties['insertEmptyLineAfterLogMessage'],
): void {
  textEditor.insert(
    new Position(
      lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg,
      0,
    ),
    `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
      lineOfLogMsg === document.lineCount ? '\n' : ''
    }${debuggingMsg}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
  );
}

function debuggingMsgQuote(settingQuote: string, selectedVar: string): string {
  const trimmedVar = selectedVar.trim();
  // If the variable starts with `{`, it's likely an object literal → use backticks
  if (trimmedVar.startsWith('{')) {
    return '`';
  }
  if (selectedVar.includes(`"`)) {
    return '`';
  }
  if (selectedVar.includes(`'`)) {
    return '"';
  }
  return settingQuote;
}

function constructDebuggingMsgContent(
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  lineOfLogMsg: number,
  extensionProperties: Omit<
    ExtensionProperties,
    'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'
  >,
  lineCodeProcessing: LineCodeProcessing,
): string {
  const {
    includeFilename,
    includeLineNum,
    logFunction,
    logType,
    logMessagePrefix,
    logMessageSuffix,
    delimiterInsideMessage,
    insertEmptyLineBeforeLogMessage,
    quote,
    insertEnclosingClass,
    insertEnclosingFunction,
  } = extensionProperties;
  const fileName = document.fileName.includes('/')
    ? document.fileName.split('/')[document.fileName.split('/').length - 1]
    : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
  let classThatEncloseTheVar = '';
  if (insertEnclosingClass) {
    classThatEncloseTheVar = enclosingBlockName(
      document,
      lineOfSelectedVar,
      'class',
      lineCodeProcessing,
    );
  }
  let funcThatEncloseTheVar = '';
  if (insertEnclosingFunction) {
    funcThatEncloseTheVar = enclosingBlockName(
      document,
      lineOfSelectedVar,
      'function',
      lineCodeProcessing,
    );
  }
  const semicolon: string = extensionProperties.addSemicolonInTheEnd ? ';' : '';
  const quoteToUse: string = debuggingMsgQuote(quote, selectedVar);
  return `${
    logFunction !== 'log' ? logFunction : `console.${logType}`
  }(${quoteToUse}${logMessagePrefix}${
    logMessagePrefix.length !== 0 &&
    delimiterInsideMessage.length !== 0 &&
    logMessagePrefix !== `${delimiterInsideMessage} `
      ? ` ${delimiterInsideMessage} `
      : ' '
  }${
    includeFilename || includeLineNum
      ? `${includeFilename ? fileName : ''}${includeLineNum ? ':' : ''}${
          includeLineNum
            ? lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1)
            : ''
        }${delimiterInsideMessage ? ` ${delimiterInsideMessage} ` : ' '}`
      : ''
  }${
    classThatEncloseTheVar.length > 0
      ? `${classThatEncloseTheVar}${
          delimiterInsideMessage ? ` ${delimiterInsideMessage} ` : ''
        }`
      : ''
  }${
    funcThatEncloseTheVar.length > 0
      ? `${funcThatEncloseTheVar}${
          delimiterInsideMessage ? ` ${delimiterInsideMessage} ` : ' '
        }`
      : ''
  }${selectedVar}${logMessageSuffix}${quoteToUse}, ${selectedVar})${semicolon}`;
}

export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  tabSize: number,
  extensionProperties: ExtensionProperties,
  lineCodeProcessing: LineCodeProcessing,
  debugMessageLine: DebugMessageLine,
  jsDebugMessageAnonymous: JSDebugMessageAnonymous,
): void {
  const logMsg: LogMessage = logMessage(
    document,
    lineOfSelectedVar,
    selectedVar,
    lineCodeProcessing,
  );
  const lineOfLogMsg: number = debugMessageLine.line(
    document,
    lineOfSelectedVar,
    selectedVar,
    logMsg,
  );
  const spacesBeforeMsg: string = spacesBeforeLogMsg(
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      : lineOfSelectedVar,
    lineOfLogMsg,
  );
  const debuggingMsgContent: string = constructDebuggingMsgContent(
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      : selectedVar,
    lineOfSelectedVar,
    lineOfLogMsg,
    omit(extensionProperties, [
      'wrapLogMessage',
      'insertEmptyLineAfterLogMessage',
    ]),
    lineCodeProcessing,
  );
  const debuggingMsg: string = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
  );
  const selectedVarLine = document.lineAt(lineOfSelectedVar);
  const selectedVarLineLoc = selectedVarLine.text;
  if (isEmptyBlockContext(document, logMsg)) {
    const emptyBlockLine =
      logMsg.logMessageType === LogMessageType.MultilineParenthesis
        ? document.lineAt(
            (logMsg.metadata as LogContextMetadata).closingContextLine,
          )
        : document.lineAt((logMsg.metadata as NamedFunctionMetadata).line);
    emptyBlockDebuggingMsg(
      document,
      textEditor,
      emptyBlockLine,
      lineOfLogMsg,
      debuggingMsgContent,
      spacesBeforeMsg,
    );
    return;
  }
  if (
    jsDebugMessageAnonymous.isAnonymousFunctionContext(
      selectedVar,
      selectedVarLineLoc,
    ) &&
    !hasFunctionBody(document, lineOfSelectedVar)
  ) {
    jsDebugMessageAnonymous.anonymousPropDebuggingMsg(
      document,
      textEditor,
      tabSize,
      extensionProperties.addSemicolonInTheEnd,
      selectedVarLine,
      debuggingMsgContent,
    );
    return;
  }
  baseDebuggingMsg(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );
}
