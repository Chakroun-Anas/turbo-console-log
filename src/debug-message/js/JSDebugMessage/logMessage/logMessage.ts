import { TextDocument } from 'vscode';
import { LogMessageType, LogMessage } from '../../../../entities';
import { LineCodeProcessing } from '../../../../line-code-processing';
import {
  arrayAssignmentChecker,
  binaryExpressionChecker,
  functionCallAssignmentChecker,
  functionParameterChecker,
  logTypeOrder,
  multiLineAnonymousFunctionChecker,
  multilineBracesChecker,
  multilineParenthesisChecker,
  namedFunctionAssignmentChecker,
  objectFunctionCallAssignmentChecker,
  objectLiteralChecker,
  primitiveAssignmentChecker,
  propertyAccessAssignmentChecker,
  templateStringChecker,
  ternaryChecker,
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
      objectLiteralChecker(document, selectionLine, selectedVar),
    [LogMessageType.FunctionParameter]: () =>
      functionParameterChecker(document, selectionLine, selectedVar),
    [LogMessageType.ArrayAssignment]: () =>
      arrayAssignmentChecker(document, selectionLine, selectedVar),
    [LogMessageType.TemplateString]: () =>
      templateStringChecker(document, selectionLine, selectedVar),
    [LogMessageType.Ternary]: () =>
      ternaryChecker(document, selectionLine, selectedVar),
    [LogMessageType.BinaryExpression]: () =>
      binaryExpressionChecker(document, selectionLine, selectedVar),
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
      return objectFunctionCallAssignmentChecker(
        document,
        selectionLine,
        selectedVar,
      );
    },
    [LogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(document, selectionLine, selectedVar),
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
