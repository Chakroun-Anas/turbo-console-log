import ts from 'typescript';
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
  withinConditionBlockChecker,
  wanderingExpressionChecker,
} from './helpers';

export function logMessage(
  sourceFile: ts.SourceFile,
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
      withinReturnStatementChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.WithinConditionBlock]: () =>
      withinConditionBlockChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.ObjectLiteral]: () =>
      objectLiteralChecker(sourceFile, document, selectionLine, selectedVar),
    [LogMessageType.FunctionParameter]: () =>
      functionParameterChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.ArrayAssignment]: () =>
      arrayAssignmentChecker(sourceFile, document, selectionLine, selectedVar),
    [LogMessageType.TemplateString]: () =>
      templateStringChecker(sourceFile, document, selectionLine, selectedVar),
    [LogMessageType.Ternary]: () =>
      ternaryChecker(sourceFile, document, selectionLine, selectedVar),
    [LogMessageType.BinaryExpression]: () =>
      binaryExpressionChecker(sourceFile, document, selectionLine, selectedVar),
    [LogMessageType.RawPropertyAccess]: () =>
      rawPropertyAccessChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.PropertyMethodCall]: () =>
      propertyMethodCallChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.ObjectFunctionCallAssignment]: () => {
      return objectFunctionCallAssignmentChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    },
    [LogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.NamedFunctionAssignment]: () =>
      namedFunctionAssignmentChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.WanderingExpression]: () =>
      wanderingExpressionChecker(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      ),
    [LogMessageType.PropertyAccessAssignment]: () => {
      return propertyAccessAssignmentChecker(
        sourceFile,
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
