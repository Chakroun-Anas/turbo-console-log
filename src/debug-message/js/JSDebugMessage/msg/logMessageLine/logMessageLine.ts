import { TextDocument } from 'vscode';
import { LogMessage, LogMessageType } from '@/entities';
import { type AcornNode } from '../acorn-utils';
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
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
  logMsg: LogMessage,
): number {
  switch (logMsg.logMessageType) {
    case LogMessageType.WithinReturnStatement: {
      return withinReturnStatementLine(
        ast,
        document,
        selectionLine,
        selectedVar,
      );
    }
    case LogMessageType.WithinConditionBlock: {
      return withinConditionBlockLine(
        ast,
        document,
        selectionLine,
        selectedVar,
      );
    }
    case LogMessageType.PrimitiveAssignment:
      return primitiveAssignmentLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.PropertyAccessAssignment:
      return propertyAccessAssignmentLine(
        ast,
        document,
        selectionLine,
        selectedVar,
      );
    case LogMessageType.FunctionParameter:
      return functionParameterLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.ObjectLiteral:
      return objectLiteralLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.NamedFunctionAssignment:
      return functionAssignmentLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.ObjectFunctionCallAssignment:
      return functionCallLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.FunctionCallAssignment:
      return functionCallLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.ArrayAssignment:
      return arrayLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.RawPropertyAccess:
      return rawPropertyAccessLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.PropertyMethodCall:
      return propertyMethodCallLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.TemplateString:
      return templateStringLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.BinaryExpression:
      return binaryExpressionLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.Ternary:
      return ternaryExpressionLine(ast, document, selectionLine, selectedVar);
    case LogMessageType.WanderingExpression:
      return wanderingExpressionLine(ast, document, selectionLine, selectedVar);
    default:
      return selectionLine + 1;
  }
}
