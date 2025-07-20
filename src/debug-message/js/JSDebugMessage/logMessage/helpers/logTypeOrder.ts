import { LogMessageType } from '@/entities';

export const logTypeOrder = [
  { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 1 },
  { logMessageType: LogMessageType.FunctionParameter, priority: 2 },
  { logMessageType: LogMessageType.ObjectFunctionCallAssignment, priority: 3 },
  { logMessageType: LogMessageType.FunctionCallAssignment, priority: 4 },
  { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 5 },

  { logMessageType: LogMessageType.ObjectLiteral, priority: 6 },
  { logMessageType: LogMessageType.ArrayAssignment, priority: 7 },
  { logMessageType: LogMessageType.TemplateString, priority: 8 },
  { logMessageType: LogMessageType.WithinReturnStatement, priority: 9 },

  { logMessageType: LogMessageType.PropertyMethodCall, priority: 10 },
  { logMessageType: LogMessageType.Ternary, priority: 11 },
  { logMessageType: LogMessageType.BinaryExpression, priority: 12 },
  { logMessageType: LogMessageType.WithinConditionBlock, priority: 13 },
  { logMessageType: LogMessageType.RawPropertyAccess, priority: 14 },
  { logMessageType: LogMessageType.PrimitiveAssignment, priority: 15 },
];
