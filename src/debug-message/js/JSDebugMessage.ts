import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  BracketType,
  LogMessageType,
  Message,
  LogMessage,
  MultilineContextVariable,
} from '../../entities';
import { LineCodeProcessing } from '../../line-code-processing';
import _, { omit } from 'lodash';
import { DebugMessage } from '../DebugMessage';
import { DebugMessageLine } from '../DebugMessageLine';
import {
  getMultiLineContextVariable,
  closingContextLine,
} from '../../utilities';
import { JSDebugMessageAnonymous } from './JSDebugMessageAnonymous';
import {
  LogContextMetadata,
  NamedFunctionMetadata,
} from '../../entities/extension/logMessage';

const logMessageTypeVerificationPriority = _.sortBy(
  [
    { logMessageType: LogMessageType.ArrayAssignment, priority: 2 },
    { logMessageType: LogMessageType.ObjectLiteral, priority: 3 },
    {
      logMessageType: LogMessageType.ObjectFunctionCallAssignment,
      priority: 4,
    },
    { logMessageType: LogMessageType.NamedFunction, priority: 6 },
    { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 5 },
    { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 7 },
    { logMessageType: LogMessageType.MultilineParenthesis, priority: 8 },
    { logMessageType: LogMessageType.MultilineBraces, priority: 9 },
    { logMessageType: LogMessageType.PrimitiveAssignment, priority: 10 },
    { logMessageType: LogMessageType.Decorator, priority: 0 },
    { logMessageType: LogMessageType.Ternary, priority: 1 },
  ],
  'priority',
);

export class JSDebugMessage extends DebugMessage {
  jsDebugMessageAnonymous: JSDebugMessageAnonymous;
  constructor(
    lineCodeProcessing: LineCodeProcessing,
    debugMessageLine: DebugMessageLine,
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
  private isEmptyBlockContext(document: TextDocument, logMessage: LogMessage) {
    if (logMessage.logMessageType === LogMessageType.MultilineParenthesis) {
      return /\){.*}/.test(
        document
          .lineAt(
            (logMessage.metadata as LogContextMetadata).closingContextLine,
          )
          .text.replace(/\s/g, ''),
      );
    }
    if (logMessage.logMessageType === LogMessageType.NamedFunction) {
      return /\){.*}/.test(
        document
          .lineAt((logMessage.metadata as NamedFunctionMetadata).line)
          .text.replace(/\s/g, ''),
      );
    }
    return false;
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
    }${selectedVar}${extensionProperties.logMessageSuffix}${
      extensionProperties.quote
    }, ${selectedVar})${semicolon}`;
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
  private deepObjectProperty(
    document: TextDocument,
    line: number,
    path = '',
  ): { path: string; line: number } | null {
    const lineText = document.lineAt(line).text;
    const propertyNameRegex = /(\w+):\s*\{/;
    const propertyNameRegexMatch = propertyNameRegex.exec(lineText);
    if (propertyNameRegexMatch) {
      const multilineBracesVariable: MultilineContextVariable | null =
        getMultiLineContextVariable(document, line, BracketType.CURLY_BRACES);
      if (multilineBracesVariable) {
        return this.deepObjectProperty(
          document,
          multilineBracesVariable.openingContextLine,
          `${propertyNameRegexMatch[1]}.${path}`,
        );
      }
    } else if (
      this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
        `${document.lineAt(line).text}${document.lineAt(line + 1).text})}`,
      )
    ) {
      return {
        path: `${document
          .lineAt(line)
          .text.split('=')[0]
          .replace(/(const|let|var)/, '')
          .trim()}.${path}`,
        line: closingContextLine(document, line, BracketType.CURLY_BRACES),
      };
    }
    return null;
  }
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void {
    const logMsg: LogMessage = this.logMessage(
      document,
      lineOfSelectedVar,
      selectedVar,
    );
    const lineOfLogMsg: number = this.line(
      document,
      lineOfSelectedVar,
      selectedVar,
      logMsg,
    );
    const spacesBeforeMsg: string = this.spacesBeforeLogMsg(
      document,
      (logMsg.metadata as LogContextMetadata)?.deepObjectLine
        ? (logMsg.metadata as LogContextMetadata)?.deepObjectLine
        : lineOfSelectedVar,
      lineOfLogMsg,
    );
    const debuggingMsgContent: string = this.constructDebuggingMsgContent(
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
    );
    const debuggingMsg: string = this.constructDebuggingMsg(
      extensionProperties,
      debuggingMsgContent,
      spacesBeforeMsg,
    );
    const selectedVarLine = document.lineAt(lineOfSelectedVar);
    const selectedVarLineLoc = selectedVarLine.text;
    if (this.isEmptyBlockContext(document, logMsg)) {
      const emptyBlockLine =
        logMsg.logMessageType === LogMessageType.MultilineParenthesis
          ? document.lineAt(
              (logMsg.metadata as LogContextMetadata).closingContextLine,
            )
          : document.lineAt((logMsg.metadata as NamedFunctionMetadata).line);
      this.emptyBlockDebuggingMsg(
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
  logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessage {
    const currentLineText: string = document.lineAt(selectionLine).text;
    const multilineParenthesisVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
    );
    const multilineBracesVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.CURLY_BRACES,
    );
    const logMsgTypesChecks: {
      [key in LogMessageType]: () => {
        isChecked: boolean;
        metadata?: Pick<LogMessage, 'metadata'>;
      };
    } = {
      [LogMessageType.ObjectLiteral]: () => {
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
        }

        let nextLineIndex = selectionLine + 1;
        let nextLineText = document
          .lineAt(nextLineIndex)
          .text.replace(/\s/g, '');

        // Skip comment-only lines
        while (
          nextLineText.trim().startsWith('//') ||
          nextLineText.trim().startsWith('/*')
        ) {
          if (nextLineText.trim().startsWith('/*')) {
            // Skip lines until the end of the multi-line comment
            while (!nextLineText.trim().endsWith('*/')) {
              nextLineIndex++;
              if (nextLineIndex >= document.lineCount) {
                return {
                  isChecked: false,
                };
              }
              nextLineText = document
                .lineAt(nextLineIndex)
                .text.replace(/\s/g, '');
            }
            nextLineIndex++;
          } else {
            nextLineIndex++;
          }

          if (nextLineIndex >= document.lineCount) {
            return {
              isChecked: false,
            };
          }
          nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');
        }

        const combinedText = `${currentLineText}${nextLineText}`;
        return {
          isChecked:
            this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
              combinedText,
            ),
        };
      },

      [LogMessageType.Decorator]: () => {
        return {
          isChecked: /^@[a-zA-Z0-9]{1,}(.*)[a-zA-Z0-9]{1,}/.test(
            currentLineText.trim(),
          ),
        };
      },
      [LogMessageType.ArrayAssignment]: () => {
        return {
          isChecked: this.lineCodeProcessing.isArrayAssignedToVariable(
            `${currentLineText}\n${currentLineText}`,
          ),
        };
      },
      [LogMessageType.Ternary]: () => {
        return {
          isChecked: /`/.test(currentLineText),
        };
      },
      [LogMessageType.MultilineBraces]: () => {
        const isChecked =
          multilineBracesVariable !== null &&
          !this.lineCodeProcessing.isAssignedToVariable(currentLineText) &&
          !this.lineCodeProcessing.isAffectationToVariable(currentLineText);
        // FIXME: No need for multilineBracesVariable !== null since it contribute already in the value of isChecked boolean
        if (isChecked && multilineBracesVariable !== null) {
          const deepObjectProperty = this.deepObjectProperty(
            document,
            multilineBracesVariable?.openingContextLine,
            selectedVar,
          );
          if (deepObjectProperty) {
            const multilineBracesObjectScope = getMultiLineContextVariable(
              document,
              deepObjectProperty.line,
              BracketType.CURLY_BRACES,
            );
            return {
              isChecked: true,
              metadata: {
                openingContextLine:
                  multilineBracesObjectScope?.openingContextLine as number,
                closingContextLine:
                  multilineBracesObjectScope?.closingContextLine as number,
                deepObjectLine: deepObjectProperty.line,
                deepObjectPath: deepObjectProperty.path,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
          return {
            isChecked: true,
            metadata: {
              openingContextLine:
                multilineBracesVariable?.openingContextLine as number,
              closingContextLine:
                multilineBracesVariable?.closingContextLine as number,
            } as Pick<LogMessage, 'metadata'>,
          };
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.MultilineParenthesis]: () => {
        const isChecked = multilineParenthesisVariable !== null;
        if (isChecked) {
          const isOpeningCurlyBraceContext = document
            .lineAt(multilineParenthesisVariable?.closingContextLine as number)
            .text.includes('{');
          const isOpeningParenthesisContext = document
            .lineAt(selectionLine)
            .text.includes('(');
          if (isOpeningCurlyBraceContext || isOpeningParenthesisContext) {
            if (this.lineCodeProcessing.isAssignedToVariable(currentLineText)) {
              return {
                isChecked: true,
                metadata: {
                  openingContextLine: selectionLine,
                  closingContextLine: closingContextLine(
                    document,
                    multilineParenthesisVariable?.closingContextLine as number,
                    isOpeningCurlyBraceContext
                      ? BracketType.CURLY_BRACES
                      : BracketType.PARENTHESIS,
                  ),
                } as Pick<LogMessage, 'metadata'>,
              };
            }
            return {
              isChecked: true,
              metadata: {
                openingContextLine:
                  multilineParenthesisVariable?.openingContextLine as number,
                closingContextLine:
                  multilineParenthesisVariable?.closingContextLine as number,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.ObjectFunctionCallAssignment]: () => {
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
        }
        const nextLineText: string = document
          .lineAt(selectionLine + 1)
          .text.replace(/\s/g, '');
        return {
          isChecked:
            this.lineCodeProcessing.isObjectFunctionCall(
              `${currentLineText}\n${nextLineText}`,
            ) && this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
      [LogMessageType.NamedFunction]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText,
            ),
          metadata: {
            line: selectionLine,
          } as Pick<LogMessage, 'metadata'>,
        };
      },
      [LogMessageType.NamedFunctionAssignment]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(
              `${currentLineText}`,
            ) && multilineParenthesisVariable === null,
        };
      },
      [LogMessageType.MultiLineAnonymousFunction]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(
              `${currentLineText}`,
            ) &&
            this.lineCodeProcessing.isAnonymousFunction(currentLineText) &&
            this.lineCodeProcessing.shouldTransformAnonymousFunction(
              currentLineText,
            ),
        };
      },
      [LogMessageType.PrimitiveAssignment]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
    };

    for (const { logMessageType } of logMessageTypeVerificationPriority) {
      const { isChecked, metadata } =
        logMsgTypesChecks[logMessageType as keyof typeof logMsgTypesChecks]();
      if (logMessageType !== LogMessageType.PrimitiveAssignment && isChecked) {
        return {
          logMessageType,
          metadata,
        };
      }
    }
    return {
      logMessageType: LogMessageType.PrimitiveAssignment,
    };
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
                closingContextLine(
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
                closingContextLine(
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
    logFunction: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let i = 0; i < documentNbrOfLines; i++) {
      const turboConsoleLogMessage = new RegExp(
        logFunction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      );
      if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        logMessage.spaces = this.spacesBeforeLogMsg(document, i, i);
        const closedParenthesisLine = closingContextLine(
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
          new RegExp(logMessagePrefix).test(msg) ||
          new RegExp(delimiterInsideMessage).test(msg)
        ) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}
