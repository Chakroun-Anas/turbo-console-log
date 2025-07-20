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
} from './helpers';

export function line(
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
  logMsg: LogMessage,
): number {
  switch (logMsg.logMessageType) {
    case LogMessageType.WithinReturnStatement: {
      return withinReturnStatementLine(document, selectionLine, selectedVar);
    }
    case LogMessageType.WithinConditionBlock: {
      return withinConditionBlockLine(document, selectionLine, selectedVar);
    }
    case LogMessageType.PrimitiveAssignment:
      return primitiveAssignmentLine(document, selectionLine, selectedVar);
    case LogMessageType.PropertyAccessAssignment:
      return propertyAccessAssignmentLine(document, selectionLine, selectedVar);
    case LogMessageType.FunctionParameter:
      return functionParameterLine(document, selectionLine, selectedVar);
    case LogMessageType.ObjectLiteral:
      return objectLiteralLine(document, selectionLine, selectedVar);
    case LogMessageType.NamedFunctionAssignment:
      return functionAssignmentLine(document, selectionLine, selectedVar);
    case LogMessageType.ObjectFunctionCallAssignment:
      return functionCallLine(document, selectionLine, selectedVar);
    case LogMessageType.FunctionCallAssignment:
      return functionCallLine(document, selectionLine, selectedVar);
    case LogMessageType.ArrayAssignment:
      return arrayLine(document, selectionLine, selectedVar);
    case LogMessageType.RawPropertyAccess:
      return rawPropertyAccessLine(document, selectionLine, selectedVar);
    case LogMessageType.PropertyMethodCall:
      return propertyMethodCallLine(document, selectionLine, selectedVar);
    case LogMessageType.TemplateString:
      return templateStringLine(document, selectionLine, selectedVar);
    case LogMessageType.BinaryExpression:
      return binaryExpressionLine(document, selectionLine, selectedVar);
    case LogMessageType.Ternary:
      return ternaryExpressionLine(document, selectionLine, selectedVar);
    default:
      return selectionLine + 1;
  }
}
