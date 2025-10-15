import { LogMessageType } from '@/entities';

export const logTypeOrder = [
  // Most Specific Assignment Patterns (High Priority)
  { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 1 },
  { logMessageType: LogMessageType.FunctionParameter, priority: 2 },
  { logMessageType: LogMessageType.ObjectFunctionCallAssignment, priority: 3 },
  { logMessageType: LogMessageType.FunctionCallAssignment, priority: 4 },
  { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 5 },

  // Specific Value/Expression Patterns
  { logMessageType: LogMessageType.ObjectLiteral, priority: 6 },
  { logMessageType: LogMessageType.ArrayAssignment, priority: 7 },
  { logMessageType: LogMessageType.TemplateString, priority: 8 },
  { logMessageType: LogMessageType.Ternary, priority: 9 }, // ⬆️ Moved above binary
  { logMessageType: LogMessageType.BinaryExpression, priority: 10 }, // ⬇️ Moved below ternary
  { logMessageType: LogMessageType.PropertyMethodCall, priority: 11 }, // ⬆️ Moved up

  // Basic Syntactic Patterns
  { logMessageType: LogMessageType.RawPropertyAccess, priority: 12 }, // ⬆️ Specific pattern
  { logMessageType: LogMessageType.PrimitiveAssignment, priority: 13 }, // ⬆️ Specific pattern

  // Context Checkers (Lower Priority - Only when no specific pattern matches)
  { logMessageType: LogMessageType.WithinConditionBlock, priority: 14 }, // ⬇️ Context fallback
  { logMessageType: LogMessageType.WithinReturnStatement, priority: 15 }, // ⬇️ Context fallback

  // Final Fallback
  { logMessageType: LogMessageType.WanderingExpression, priority: 16 },
];
