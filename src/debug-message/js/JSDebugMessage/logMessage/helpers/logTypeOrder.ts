import { LogMessageType } from '../../../../../entities';

export const logTypeOrder = [
  { logMessageType: LogMessageType.Decorator, priority: 0 },
  { logMessageType: LogMessageType.TemplateString, priority: 1 },
  { logMessageType: LogMessageType.ArrayAssignment, priority: 2 },
  { logMessageType: LogMessageType.FunctionParameter, priority: 3 },
  { logMessageType: LogMessageType.ObjectLiteral, priority: 4 },
  {
    logMessageType: LogMessageType.ObjectFunctionCallAssignment,
    priority: 5,
  },
  {
    logMessageType: LogMessageType.FunctionCallAssignment,
    priority: 6,
  },
  {
    logMessageType: LogMessageType.TypedFunctionCallAssignment,
    priority: 7,
  },
  { logMessageType: LogMessageType.Ternary, priority: 8 },
  { logMessageType: LogMessageType.NullishCoalescing, priority: 9 },
  { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 10 },
  { logMessageType: LogMessageType.NamedFunction, priority: 11 },
  { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 12 },
  { logMessageType: LogMessageType.PrimitiveAssignment, priority: 13 },
  { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 14 },
  { logMessageType: LogMessageType.MultilineParenthesis, priority: 16 },
  { logMessageType: LogMessageType.MultilineBraces, priority: 16 },
].sort((a, b) => a.priority - b.priority);
