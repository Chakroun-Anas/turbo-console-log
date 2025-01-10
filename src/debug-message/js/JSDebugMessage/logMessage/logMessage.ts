import { TextDocument } from 'vscode';
import _ from 'lodash';
import { BracketType, LogMessageType, LogMessage } from '../../../../entities';
import {
  getMultiLineContextVariable,
  closingContextLine,
} from '../../../../utilities';
import { LineCodeProcessing } from '../../../../line-code-processing';
import { deepObjectProperty } from '../helpers/deepObjectProperty';

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

export function logMessage(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
  lineCodeProcessing: LineCodeProcessing,
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
      let nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');

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
          lineCodeProcessing.isObjectLiteralAssignedToVariable(combinedText),
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
        isChecked: lineCodeProcessing.isArrayAssignedToVariable(
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
        !lineCodeProcessing.isAssignedToVariable(currentLineText) &&
        !lineCodeProcessing.isAffectationToVariable(currentLineText);
      // FIXME: No need for multilineBracesVariable !== null since it contribute already in the value of isChecked boolean
      if (isChecked && multilineBracesVariable !== null) {
        const deepObjectPropertyResult = deepObjectProperty(
          document,
          multilineBracesVariable?.openingContextLine,
          selectedVar,
          lineCodeProcessing,
        );
        if (deepObjectPropertyResult) {
          const multilineBracesObjectScope = getMultiLineContextVariable(
            document,
            deepObjectPropertyResult.line,
            BracketType.CURLY_BRACES,
          );
          return {
            isChecked: true,
            metadata: {
              openingContextLine:
                multilineBracesObjectScope?.openingContextLine as number,
              closingContextLine:
                multilineBracesObjectScope?.closingContextLine as number,
              deepObjectLine: deepObjectPropertyResult.line,
              deepObjectPath: deepObjectPropertyResult.path,
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
        if (lineCodeProcessing.isAssignedToVariable(currentLineText)) {
          if (isOpeningCurlyBraceContext) {
            return {
              isChecked: true,
              metadata: {
                openingContextLine: selectionLine,
                closingContextLine: closingContextLine(
                  document,
                  multilineParenthesisVariable?.closingContextLine as number,
                  BracketType.CURLY_BRACES,
                ),
              } as Pick<LogMessage, 'metadata'>,
            };
          }
          return {
            isChecked: false,
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
          lineCodeProcessing.isObjectFunctionCall(
            `${currentLineText}\n${nextLineText}`,
          ) && lineCodeProcessing.isAssignedToVariable(currentLineText),
      };
    },
    [LogMessageType.NamedFunction]: () => {
      return {
        isChecked:
          lineCodeProcessing.doesContainsNamedFunctionDeclaration(
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
          lineCodeProcessing.isFunctionAssignedToVariable(
            `${currentLineText}`,
          ) && multilineParenthesisVariable === null,
      };
    },
    [LogMessageType.MultiLineAnonymousFunction]: () => {
      return {
        isChecked:
          lineCodeProcessing.isFunctionAssignedToVariable(
            `${currentLineText}`,
          ) &&
          lineCodeProcessing.isAnonymousFunction(currentLineText) &&
          lineCodeProcessing.shouldTransformAnonymousFunction(currentLineText),
      };
    },
    [LogMessageType.PrimitiveAssignment]: () => {
      return {
        isChecked: lineCodeProcessing.isAssignedToVariable(currentLineText),
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
