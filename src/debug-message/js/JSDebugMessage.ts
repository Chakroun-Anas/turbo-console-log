import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  BracketType,
  LogMessageType,
  Message,
} from '../../entities';
import { LineCodeProcessing } from '../../line-code-processing';
import _, { omit } from 'lodash';
import { DebugMessage } from '../DebugMessage';
import { DebugMessageLine } from '../DebugMessageLine';
import { JSDebugMessageLine } from './JSDebugMessageLine';
import {
  getMultiLineContextVariableLine,
  closingBracketLine,
} from '../../utilities';
import { JSDebugMessageAnonymous } from './JSDebugMessageAnonymous';

const logMessageTypeVerificationPriority = _.sortBy(
  [
    { logMessageType: LogMessageType.ArrayAssignment, priority: 2 },
    { logMessageType: LogMessageType.ObjectLiteral, priority: 3 },
    { logMessageType: LogMessageType.ObjectFunctionCall, priority: 4 },
    { logMessageType: LogMessageType.NamedFunction, priority: 5 },
    { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 6 },
    { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 7 },
    { logMessageType: LogMessageType.MultilineParenthesis, priority: 8 },
    { logMessageType: LogMessageType.MultilineBraces, priority: 9 },
    { logMessageType: LogMessageType.Decorator, priority: 0 },
    { logMessageType: LogMessageType.Ternary, priority: 1 },
  ],
  'priority',
);

export class JSDebugMessage extends DebugMessage {
  jsDebugMessageAnonymous: JSDebugMessageAnonymous;
  constructor(
    lineCodeProcessing: LineCodeProcessing,
    debugMessageLine: DebugMessageLine = new JSDebugMessageLine(),
  ) {
    super(lineCodeProcessing, debugMessageLine);
    this.jsDebugMessageAnonymous = new JSDebugMessageAnonymous(
      lineCodeProcessing,
    );
  }
  private baseDebuggingMsg(
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
  private isEmptyBlockContext(selectedVarLinerLoc: string) {
    return /\){.*}/.test(selectedVarLinerLoc.replace(/\s/g, ''));
  }
  private constructDebuggingMsg(
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
  private constructDebuggingMsgContent(
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    lineOfLogMsg: number,
    extensionProperties: Omit<
      ExtensionProperties,
      'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'
    >,
  ): string {
    const fileName = document.fileName.includes('/')
      ? document.fileName.split('/')[document.fileName.split('/').length - 1]
      : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
    const funcThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'function',
    );
    const classThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'class',
    );
    const semicolon: string = extensionProperties.addSemicolonInTheEnd
      ? ';'
      : '';
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
      extensionProperties.includeFileNameAndLineNum
        ? `file: ${fileName}:${
            lineOfLogMsg +
            (extensionProperties.insertEmptyLineBeforeLogMessage ? 2 : 1)
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
    }${selectedVar}${extensionProperties.quote}, ${selectedVar})${semicolon}`;
  }

  private emptyBlockDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    emptyBlockLine: TextLine,
    logMsgLine: number,
    debuggingMsg: string,
    spacesBeforeMsg: string,
  ) {
    if (/\){.*}/.test(emptyBlockLine.text.replace(/\s/g, ''))) {
      const textBeforeClosedFunctionParenthesis =
        emptyBlockLine.text.split(')')[0];
      textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
      textEditor.insert(
        new Position(
          logMsgLine >= document.lineCount ? document.lineCount : logMsgLine,
          0,
        ),
        `${textBeforeClosedFunctionParenthesis}) {\n${
          logMsgLine === document.lineCount ? '\n' : ''
        }${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}}\n`,
      );
      return;
    }
  }
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void {
    const logMsgType: LogMessageType = this.logMessageType(
      document,
      lineOfSelectedVar,
      selectedVar,
    );
    const lineOfLogMsg: number = this.line(
      document,
      lineOfSelectedVar,
      selectedVar,
      logMsgType,
    );
    const spacesBeforeMsg: string = this.spacesBeforeLogMsg(
      document,
      lineOfSelectedVar,
      lineOfLogMsg,
    );
    const debuggingMsgContent: string = this.constructDebuggingMsgContent(
      document,
      selectedVar,
      lineOfSelectedVar,
      lineOfLogMsg,
      omit(extensionProperties, [
        'wrapLogMessage',
        'insertEmptyLineAfterLogMessage',
      ]),
    );
    const debuggingMsg: string = this.constructDebuggingMsg(
      extensionProperties,
      debuggingMsgContent,
      spacesBeforeMsg,
    );
    const selectedVarLine = document.lineAt(lineOfSelectedVar);
    const selectedVarLineLoc = selectedVarLine.text;
    if (this.isEmptyBlockContext(selectedVarLineLoc)) {
      this.emptyBlockDebuggingMsg(
        document,
        textEditor,
        selectedVarLine,
        lineOfLogMsg,
        debuggingMsgContent,
        spacesBeforeMsg,
      );
      return;
    }
    if (
      this.jsDebugMessageAnonymous.isAnonymousFunctionContext(
        selectedVar,
        selectedVarLineLoc,
      )
    ) {
      this.jsDebugMessageAnonymous.anonymousPropDebuggingMsg(
        document,
        textEditor,
        tabSize,
        extensionProperties.addSemicolonInTheEnd,
        selectedVarLine,
        debuggingMsgContent,
      );
      return;
    }
    this.baseDebuggingMsg(
      document,
      textEditor,
      lineOfLogMsg,
      debuggingMsg,
      extensionProperties.insertEmptyLineBeforeLogMessage,
      extensionProperties.insertEmptyLineAfterLogMessage,
    );
  }
  logMessageType(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessageType {
    const currentLineText: string = document.lineAt(selectionLine).text;
    const multilineParenthesisVariableLine = getMultiLineContextVariableLine(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
    );
    const multilineBracesVariableLine = getMultiLineContextVariableLine(
      document,
      selectionLine,
      BracketType.CURLY_BRACES,
    );
    const logMsgTypesChecks = {
      [LogMessageType.ObjectLiteral]: () => {
        if (document.lineCount === selectionLine + 1) {
          return false;
        }
        const nextLineText: string = document
          .lineAt(selectionLine + 1)
          .text.replace(/\s/g, '');
        return this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
          `${currentLineText}\n${nextLineText}`,
        );
      },
      [LogMessageType.Decorator]: () => {
        return /@[a-zA-Z0-9]{1,}(.*)[a-zA-Z0-9]{1,}/.test(currentLineText);
      },
      [LogMessageType.ArrayAssignment]: () => {
        return this.lineCodeProcessing.isArrayAssignedToVariable(
          `${currentLineText}\n${currentLineText}`,
        );
      },
      [LogMessageType.Ternary]: () => {
        return /`/.test(currentLineText);
      },
      [LogMessageType.MultilineBraces]: () => {
        return (
          multilineBracesVariableLine !== null &&
          !this.lineCodeProcessing.isAssignedToVariable(currentLineText)
        );
      },
      [LogMessageType.MultilineParenthesis]: () => {
        return (
          multilineParenthesisVariableLine !== null &&
          document
            .lineAt(multilineParenthesisVariableLine - 1)
            .text.includes('{')
        );
      },
      [LogMessageType.ObjectFunctionCall]: () => {
        if (document.lineCount === selectionLine + 1) {
          return false;
        }
        const nextLineText: string = document
          .lineAt(selectionLine + 1)
          .text.replace(/\s/g, '');
        return this.lineCodeProcessing.isObjectFunctionCall(
          `${currentLineText}\n${nextLineText}`,
        );
      },
      [LogMessageType.NamedFunction]: () => {
        return this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
          currentLineText,
        );
      },
      [LogMessageType.NamedFunctionAssignment]: () => {
        return (
          this.lineCodeProcessing.isFunctionAssignedToVariable(
            `${currentLineText}`,
          ) && currentLineText.split('=')[0].includes(selectedVar)
        );
      },
      [LogMessageType.MultiLineAnonymousFunction]: () => {
        return (
          this.lineCodeProcessing.isFunctionAssignedToVariable(
            `${currentLineText}`,
          ) &&
          this.lineCodeProcessing.isAnonymousFunction(currentLineText) &&
          this.lineCodeProcessing.shouldTransformAnonymousFunction(
            currentLineText,
          )
        );
      },
    };

    for (const { logMessageType } of logMessageTypeVerificationPriority) {
      if (
        logMessageType !== LogMessageType.PrimitiveAssignment &&
        logMsgTypesChecks[logMessageType as keyof typeof logMsgTypesChecks]()
      ) {
        return logMessageType as LogMessageType;
      }
    }
    return LogMessageType.PrimitiveAssignment;
  }
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string {
    let currentLineNum: number = lineOfSelectedVar;
    while (currentLineNum >= 0) {
      const currentLineText: string = document.lineAt(currentLineNum).text;
      switch (blockType) {
        case 'class':
          if (
            this.lineCodeProcessing.doesContainClassDeclaration(currentLineText)
          ) {
            if (
              lineOfSelectedVar > currentLineNum &&
              lineOfSelectedVar <
                closingBracketLine(
                  document,
                  currentLineNum,
                  BracketType.CURLY_BRACES,
                )
            ) {
              return `${this.lineCodeProcessing.getClassName(currentLineText)}`;
            }
          }
          break;
        case 'function':
          if (
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText,
            ) &&
            !this.lineCodeProcessing.doesContainsBuiltInFunction(
              currentLineText,
            )
          ) {
            if (
              lineOfSelectedVar >= currentLineNum &&
              lineOfSelectedVar <
                closingBracketLine(
                  document,
                  currentLineNum,
                  BracketType.CURLY_BRACES,
                )
            ) {
              if (
                this.lineCodeProcessing.getFunctionName(currentLineText)
                  .length !== 0
              ) {
                return `${this.lineCodeProcessing.getFunctionName(
                  currentLineText,
                )}`;
              }
              return '';
            }
          }
          break;
      }
      currentLineNum--;
    }
    return '';
  }
  detectAll(
    document: TextDocument,
    delemiterInsideMessage: string,
    quote: string,
  ): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let i = 0; i < documentNbrOfLines; i++) {
      const turboConsoleLogMessage = /console\.log\(/;
      if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        logMessage.spaces = this.spacesBeforeLogMsg(document, i, i);
        const closedParenthesisLine = closingBracketLine(
          document,
          i,
          BracketType.PARENTHESIS,
        );
        let msg = '';
        for (let j = i; j <= closedParenthesisLine; j++) {
          msg += document.lineAt(j).text;
          logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        }
        if (
          new RegExp(
            `${delemiterInsideMessage}[a-zA-Z0-9]+${quote},(//)?[a-zA-Z0-9]+`,
          ).test(msg.replace(/\s/g, ''))
        ) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}
