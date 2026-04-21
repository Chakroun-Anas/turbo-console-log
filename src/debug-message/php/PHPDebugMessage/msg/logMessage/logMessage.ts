/**
 * Main function to detect the type of log message context in PHP code.
 * Analyzes the AST to determine what kind of PHP construct we're logging.
 *
 * This follows the same pattern as the JS/TS implementation.
 */

import type { TextDocument } from 'vscode';
import type { Program } from '../php-parser-utils/types';
import {
  PHPLogMessageType,
  type PHPLogMessage,
  type PHPLogMessageCheckerResult,
} from './phpLogMessageTypes';
import {
  primitiveAssignmentChecker,
  phpLogTypeOrder,
  arrayAssignmentChecker,
  functionCallAssignmentChecker,
  objectFunctionCallAssignmentChecker,
  propertyAccessAssignmentChecker,
  functionParameterChecker,
  ternaryChecker,
  withinReturnStatementChecker,
  propertyMethodCallChecker,
  binaryExpressionChecker,
  stringInterpolationChecker,
  withinConditionBlockChecker,
} from './helpers';

/**
 * Detects the type of log message based on the PHP AST and selected variable.
 *
 * @param ast The parsed PHP AST Program node
 * @param document The VS Code TextDocument
 * @param selectionLine The line number where the selection is (0-based)
 * @param selectedVar The variable/expression selected by the user
 * @returns PHPLogMessage object with type and metadata
 */
export function logMessage(
  ast: Program,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PHPLogMessage {
  // Define all checker functions mapped to their types
  const logMsgTypesChecks: {
    [key in PHPLogMessageType]: () => PHPLogMessageCheckerResult;
  } = {
    [PHPLogMessageType.WithinReturnStatement]: () =>
      withinReturnStatementChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.WithinConditionBlock]: () =>
      withinConditionBlockChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.FunctionParameter]: () =>
      functionParameterChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.ArrayAssignment]: () =>
      arrayAssignmentChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.Ternary]: () =>
      ternaryChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.PropertyAccessAssignment]: () =>
      propertyAccessAssignmentChecker(
        ast,
        document,
        selectionLine,
        selectedVar,
      ),
    [PHPLogMessageType.FunctionCallAssignment]: () =>
      functionCallAssignmentChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.ObjectFunctionCallAssignment]: () =>
      objectFunctionCallAssignmentChecker(
        ast,
        document,
        selectionLine,
        selectedVar,
      ),
    [PHPLogMessageType.PropertyMethodCall]: () =>
      propertyMethodCallChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.BinaryExpression]: () =>
      binaryExpressionChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.StringInterpolation]: () =>
      stringInterpolationChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.PrimitiveAssignment]: () =>
      primitiveAssignmentChecker(ast, document, selectionLine, selectedVar),
    [PHPLogMessageType.WanderingExpression]: () => ({
      isChecked: false, // Fallback - not implemented yet
    }),
  };

  // Check each type in priority order
  for (const { logMessageType } of phpLogTypeOrder) {
    const { isChecked, metadata } =
      logMsgTypesChecks[logMessageType as keyof typeof logMsgTypesChecks]();
    if (isChecked) {
      return {
        logMessageType,
        metadata,
      };
    }
  }

  // Default fallback
  return {
    logMessageType: PHPLogMessageType.PrimitiveAssignment,
  };
}
