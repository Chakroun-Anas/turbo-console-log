import { TextDocument } from 'vscode';
import { LogMessageType, LogMessage, LogContextMetadata } from '@/entities';
import { type AcornNode } from '../acorn-utils';
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
  ast: AcornNode,
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
      withinReturnStatementChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.WithinConditionBlock]: () =>
      withinConditionBlockChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.ObjectLiteral]: () =>
      objectLiteralChecker(ast, selectionLine, selectedVar),
    [LogMessageType.FunctionParameter]: () =>
      functionParameterChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.ArrayAssignment]: () =>
      arrayAssignmentChecker(ast, selectionLine, selectedVar),
    [LogMessageType.TemplateString]: () =>
      templateStringChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.Ternary]: () =>
      ternaryChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.BinaryExpression]: () =>
      binaryExpressionChecker(ast, selectionLine, selectedVar),
    [LogMessageType.RawPropertyAccess]: () =>
      rawPropertyAccessChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.PropertyMethodCall]: () =>
      propertyMethodCallChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.ObjectFunctionCallAssignment]: () =>
      objectFunctionCallAssignmentChecker(ast, selectionLine, selectedVar),
    [LogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(ast, selectionLine, selectedVar),
    [LogMessageType.NamedFunctionAssignment]: () =>
      namedFunctionAssignmentChecker(ast, selectionLine, selectedVar),
    [LogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(ast, selectionLine, selectedVar),
    [LogMessageType.WanderingExpression]: () =>
      wanderingExpressionChecker(ast, document, selectionLine, selectedVar),
    [LogMessageType.PropertyAccessAssignment]: () =>
      propertyAccessAssignmentChecker(
        ast,
        document,
        selectionLine,
        selectedVar,
      ),
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
