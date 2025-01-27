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

function constructDebuggingMsg(
  extensionProperties: ExtensionProperties,
  debuggingMsgContent: string,
  spacesBeforeMsg: string,
): string {
  const wrappingMsg = `console.${extensionProperties.logType}(${
    extensionProperties.quote
  }${extensionProperties.logMessagePrefix} ${'-'.repeat(
    debuggingMsgContent.length - 16,
  )}${extensionProperties.logMessagePrefix}${extensionProperties.quote})${
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
  const fileName = document.fileName.includes('/')
    ? document.fileName.split('/')[document.fileName.split('/').length - 1]
    : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
  const funcThatEncloseTheVar: string = enclosingBlockName(
    document,
    lineOfSelectedVar,
    'function',
    lineCodeProcessing,
  );
  const classThatEncloseTheVar: string = enclosingBlockName(
    document,
    lineOfSelectedVar,
    'class',
    lineCodeProcessing,
  );
  const semicolon: string = extensionProperties.addSemicolonInTheEnd ? ';' : '';
  const includeFilename = extensionProperties.includeFilename;
  const includeLineNum = extensionProperties.includeLineNum;
  return `${
    extensionProperties.logFunction !== 'log'
      ? extensionProperties.logFunction
      : `console.${extensionProperties.logType}`
  }(${extensionProperties.quote}${extensionProperties.logMessagePrefix}${
    extensionProperties.logMessagePrefix.length !== 0 &&
    extensionProperties.logMessagePrefix !==
      `${extensionProperties.delimiterInsideMessage} `
      ? ` ${extensionProperties.delimiterInsideMessage} `
      : ''
  }${
    includeFilename || includeLineNum
      ? `${includeFilename ? fileName : ''}${includeLineNum ? ':' : ''}${
          includeLineNum
            ? lineOfLogMsg +
              (extensionProperties.insertEmptyLineBeforeLogMessage ? 2 : 1)
            : ''
        } ${extensionProperties.delimiterInsideMessage} `
      : ''
  }${
    extensionProperties.insertEnclosingClass
      ? classThatEncloseTheVar.length > 0
        ? `${classThatEncloseTheVar} ${extensionProperties.delimiterInsideMessage} `
        : ``
      : ''
  }${
    extensionProperties.insertEnclosingFunction
      ? funcThatEncloseTheVar.length > 0
        ? `${funcThatEncloseTheVar} ${extensionProperties.delimiterInsideMessage} `
        : ''
      : ''
  }${selectedVar}${extensionProperties.logMessageSuffix}${
    extensionProperties.quote
  }, ${selectedVar})${semicolon}`;
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
    )
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
