/**
 * Defines the order of priority for checking PHP log message types.
 * Earlier items have higher priority.
 */

import { PHPLogMessageType } from '../phpLogMessageTypes';

export const phpLogTypeOrder: Array<{
  logMessageType: PHPLogMessageType;
  priority: number;
}> = [
  // Most Specific Assignment Patterns (High Priority)
  { logMessageType: PHPLogMessageType.FunctionParameter, priority: 1 },
  {
    logMessageType: PHPLogMessageType.ObjectFunctionCallAssignment,
    priority: 2,
  },
  { logMessageType: PHPLogMessageType.FunctionCallAssignment, priority: 3 },
  { logMessageType: PHPLogMessageType.PropertyAccessAssignment, priority: 4 },

  // Specific Value/Expression Patterns
  { logMessageType: PHPLogMessageType.ArrayAssignment, priority: 5 },
  { logMessageType: PHPLogMessageType.StringInterpolation, priority: 6 },
  { logMessageType: PHPLogMessageType.Ternary, priority: 7 },
  { logMessageType: PHPLogMessageType.BinaryExpression, priority: 8 },
  { logMessageType: PHPLogMessageType.PropertyMethodCall, priority: 9 },

  // Basic Syntactic Patterns
  { logMessageType: PHPLogMessageType.PrimitiveAssignment, priority: 10 },

  // Context Checkers (Lower Priority - Only when no specific pattern matches)
  { logMessageType: PHPLogMessageType.WithinConditionBlock, priority: 11 },
  { logMessageType: PHPLogMessageType.WithinReturnStatement, priority: 12 },

  // Fallback
  { logMessageType: PHPLogMessageType.WanderingExpression, priority: 13 },
];
