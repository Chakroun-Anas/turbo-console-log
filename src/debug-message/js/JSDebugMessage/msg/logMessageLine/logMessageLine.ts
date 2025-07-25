import ts from 'typescript';
import { TextDocument } from 'vscode';
import { LogMessage, LogMessageType } from '@/entities';
import {
  ternaryExpressionLine,
  objectLiteralLine,
  functionAssignmentLine,
  functionCallLine,
  arrayLine,
  templateStringLine,
  primitiveAssignmentLine,
  propertyAccessAssignmentLine,
  binaryExpressionLine,
  rawPropertyAccessLine,
  propertyMethodCallLine,
  functionParameterLine,
  withinReturnStatementLine,
  withinConditionBlockLine,
  wanderingExpressionLine,
} from './helpers';

export function line(
  sourceFile: ts.SourceFile,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
  logMsg: LogMessage,
): number {
  switch (logMsg.logMessageType) {
    case LogMessageType.WithinReturnStatement: {
      return withinReturnStatementLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    }
    case LogMessageType.WithinConditionBlock: {
      return withinConditionBlockLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    }
    case LogMessageType.PrimitiveAssignment:
      return primitiveAssignmentLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.PropertyAccessAssignment:
      return propertyAccessAssignmentLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.FunctionParameter:
      return functionParameterLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.ObjectLiteral:
      return objectLiteralLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.NamedFunctionAssignment:
      return functionAssignmentLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.ObjectFunctionCallAssignment:
      return functionCallLine(sourceFile, document, selectionLine, selectedVar);
    case LogMessageType.FunctionCallAssignment:
      return functionCallLine(sourceFile, document, selectionLine, selectedVar);
    case LogMessageType.ArrayAssignment:
      return arrayLine(sourceFile, document, selectionLine, selectedVar);
    case LogMessageType.RawPropertyAccess:
      return rawPropertyAccessLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.PropertyMethodCall:
      return propertyMethodCallLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.TemplateString:
      return templateStringLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.BinaryExpression:
      return binaryExpressionLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.Ternary:
      return ternaryExpressionLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.WanderingExpression:
      return wanderingExpressionLine(
        sourceFile,
        document,
        selectionLine,
        selectedVar,
      );
    default:
      return selectionLine + 1;
  }
}
