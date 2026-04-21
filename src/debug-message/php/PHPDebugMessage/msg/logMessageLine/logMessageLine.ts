/**
 * Calculate the line number where the log message should be inserted
 * for different PHP contexts.
 */

import type { TextDocument } from 'vscode';
import type { Program } from '../php-parser-utils/types';
import type { PHPLogMessage } from '../logMessage/phpLogMessageTypes';
import { PHPLogMessageType } from '../logMessage/phpLogMessageTypes';
import {
  primitiveAssignmentLine,
  arrayAssignmentLine,
  functionCallAssignmentLine,
  objectFunctionCallAssignmentLine,
  propertyAccessAssignmentLine,
  functionParameterLine,
  ternaryLine,
  withinReturnStatementLine,
  propertyMethodCallLine,
  binaryExpressionLine,
  stringInterpolationLine,
  withinConditionBlockLine,
} from './helpers';

/**
 * Determines the appropriate line number to insert a log message
 * based on the PHP context and log message type.
 *
 * @param ast The PHP AST Program node
 * @param document The VS Code TextDocument
 * @param selectedVar The selected variable text
 * @param lineOfSelectedVar The line where the variable was selected
 * @param logMsg The detected PHP log message information
 * @returns The line number where the log should be inserted
 */
export function line(
  ast: Program,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  logMsg: PHPLogMessage,
): number {
  const { logMessageType } = logMsg;

  switch (logMessageType) {
    case PHPLogMessageType.WithinReturnStatement:
      return withinReturnStatementLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.WithinConditionBlock:
      return withinConditionBlockLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.PrimitiveAssignment:
      return primitiveAssignmentLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.ArrayAssignment:
      return arrayAssignmentLine(ast, document, lineOfSelectedVar, selectedVar);

    case PHPLogMessageType.PropertyAccessAssignment:
      return propertyAccessAssignmentLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.FunctionCallAssignment:
      return functionCallAssignmentLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.ObjectFunctionCallAssignment:
      return objectFunctionCallAssignmentLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.FunctionParameter:
      return functionParameterLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.PropertyMethodCall:
      return propertyMethodCallLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.Ternary:
      return ternaryLine(ast, document, lineOfSelectedVar, selectedVar);

    case PHPLogMessageType.BinaryExpression:
      return binaryExpressionLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.StringInterpolation:
      return stringInterpolationLine(
        ast,
        document,
        lineOfSelectedVar,
        selectedVar,
      );

    case PHPLogMessageType.WanderingExpression:
      // For wandering expressions, insert on next line
      return lineOfSelectedVar + 1;

    default:
      // Default fallback: insert on next line
      return lineOfSelectedVar + 1;
  }
}
