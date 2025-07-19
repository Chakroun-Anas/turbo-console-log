import { TextDocument } from 'vscode';
import { LogMessageType, LogMessage, LogContextMetadata } from '@/entities';
import {
  arrayAssignmentChecker,
  binaryExpressionChecker,
  functionCallAssignmentChecker,
  functionParameterChecker,
  logTypeOrder,
  namedFunctionAssignmentChecker,
  objectFunctionCallAssignmentChecker,
  objectLiteralChecker,
  primitiveAssignmentChecker,
  propertyAccessAssignmentChecker,
  templateStringChecker,
  ternaryChecker,
  rawPropertyAccessChecker,
  propertyMethodCallChecker,
  withinReturnStatementChecker,
} from './helpers';

export function logMessage(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): LogMessage {
  const logMsgTypesChecks: {
    [key in LogMessageType]: () => {
      isChecked: boolean;
      metadata?: Pick<LogMessage, 'metadata'> | LogContextMetadata;
    };
  } = {
    [LogMessageType.WithinReturnStatement]: () =>
      withinReturnStatementChecker(document, selectionLine, selectedVar),
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
    [LogMessageType.RawPropertyAccess]: () =>
      rawPropertyAccessChecker(document, selectionLine, selectedVar),
    [LogMessageType.PropertyMethodCall]: () =>
      propertyMethodCallChecker(document, selectionLine, selectedVar),
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
      namedFunctionAssignmentChecker(document, selectionLine, selectedVar),
    [LogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(document, selectionLine, selectedVar),
    [LogMessageType.PropertyAccessAssignment]: () => {
      return propertyAccessAssignmentChecker(
        document,
        selectionLine,
        selectedVar,
      );
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
