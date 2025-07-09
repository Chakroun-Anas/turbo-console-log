import { TextDocument } from 'vscode';
import { LogMessageType, LogMessage } from '../../../../entities';
import { LineCodeProcessing } from '../../../../line-code-processing';
import {
  arrayAssignmentChecker,
  decoratorChecker,
  functionCallAssignmentChecker,
  functionParameterChecker,
  logTypeOrder,
  multiLineAnonymousFunctionChecker,
  multilineBracesChecker,
  multilineParenthesisChecker,
  namedFunctionAssignmentChecker,
  nullishCoalescingChecker,
  objectFunctionCallAssignmentChecker,
  objectLiteralChecker,
  primitiveAssignmentChecker,
  propertyAccessAssignmentChecker,
  templateStringChecker,
  ternaryChecker,
  typedFunctionCallAssignmentChecker,
} from './helpers';

function getFullRhs(document: TextDocument, startLine: number): string {
  let rhs = document.lineAt(startLine).text.trim();
  let line = startLine + 1;

  while (line < document.lineCount) {
    const nextLineText = document.lineAt(line).text.trim();
    const shouldContinue =
      // eslint-disable-next-line no-useless-escape
      /[.\[]$/.test(rhs) || // RHS ends with . or [
      /\?\.$/.test(rhs) || // RHS ends with ?.
      // eslint-disable-next-line no-useless-escape
      /^[.\[]/.test(nextLineText) || // next line starts with . or [
      /^\?\./.test(nextLineText); // next line starts with ?.
    if (!shouldContinue) break;

    rhs += nextLineText;
    line++;
  }

  return rhs;
}

export function logMessage(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
  lineCodeProcessing: LineCodeProcessing,
): LogMessage {
  const logMsgTypesChecks: {
    [key in LogMessageType]: () => {
      isChecked: boolean;
      metadata?: Pick<LogMessage, 'metadata'>;
    };
  } = {
    [LogMessageType.ObjectLiteral]: () =>
      objectLiteralChecker(document, lineCodeProcessing, selectionLine),

    [LogMessageType.Decorator]: () => decoratorChecker(document, selectionLine),
    [LogMessageType.FunctionParameter]: () =>
      functionParameterChecker(document, selectionLine, selectedVar),
    [LogMessageType.ArrayAssignment]: () =>
      arrayAssignmentChecker(document, lineCodeProcessing, selectionLine),
    [LogMessageType.TemplateString]: () =>
      templateStringChecker(document, selectionLine),
    [LogMessageType.Ternary]: () =>
      ternaryChecker(document, lineCodeProcessing, selectionLine),
    [LogMessageType.NullishCoalescing]: () =>
      nullishCoalescingChecker(document, lineCodeProcessing, selectionLine),
    [LogMessageType.MultilineBraces]: () =>
      multilineBracesChecker(
        document,
        lineCodeProcessing,
        selectedVar,
        selectionLine,
      ),
    [LogMessageType.MultilineParenthesis]: () =>
      multilineParenthesisChecker(document, lineCodeProcessing, selectionLine),
    [LogMessageType.ObjectFunctionCallAssignment]: () => {
      const fullRhs = getFullRhs(document, selectionLine);
      return objectFunctionCallAssignmentChecker(
        document,
        selectionLine,
        fullRhs,
        lineCodeProcessing,
      );
    },
    [LogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(
        document,
        lineCodeProcessing,
        selectionLine,
      ),
    [LogMessageType.TypedFunctionCallAssignment]: () =>
      typedFunctionCallAssignmentChecker(
        document,
        lineCodeProcessing,
        selectionLine,
      ),
    [LogMessageType.NamedFunctionAssignment]: () =>
      namedFunctionAssignmentChecker(
        document,
        lineCodeProcessing,
        selectionLine,
      ),
    [LogMessageType.MultiLineAnonymousFunction]: () =>
      multiLineAnonymousFunctionChecker(
        document,
        lineCodeProcessing,
        selectionLine,
      ),
    [LogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(document, lineCodeProcessing, selectionLine),
    [LogMessageType.PropertyAccessAssignment]: () => {
      const fullRhs = getFullRhs(document, selectionLine);
      return propertyAccessAssignmentChecker(lineCodeProcessing, fullRhs);
    },
  };

  for (const { logMessageType } of logTypeOrder) {
    const { isChecked, metadata } =
      logMsgTypesChecks[logMessageType as keyof typeof logMsgTypesChecks]();
    if (isChecked) {
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
