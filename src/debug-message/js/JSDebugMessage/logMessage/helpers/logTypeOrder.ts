import { LogMessageType } from '../../../../../entities';

export const logTypeOrder = [
  { logMessageType: LogMessageType.TemplateString, priority: 1 }, // AST
  { logMessageType: LogMessageType.ArrayAssignment, priority: 2 }, // REGEX
  { logMessageType: LogMessageType.FunctionParameter, priority: 3 }, // AST
  { logMessageType: LogMessageType.ObjectLiteral, priority: 4 }, // REGEX
  {
    logMessageType: LogMessageType.ObjectFunctionCallAssignment, // REGEX
    priority: 5,
  },
  {
    logMessageType: LogMessageType.FunctionCallAssignment, // REGEX
    priority: 6,
  },
  {
    logMessageType: LogMessageType.TypedFunctionCallAssignment, // REGEX
    priority: 7,
  },
  { logMessageType: LogMessageType.Ternary, priority: 8 }, // AST
  { logMessageType: LogMessageType.NullishCoalescing, priority: 9 }, // REGEX
  { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 10 }, // REGEX
  { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 11 }, // REGEX
  { logMessageType: LogMessageType.PrimitiveAssignment, priority: 12 }, // AST
  { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 13 }, // REGEX
  { logMessageType: LogMessageType.MultilineParenthesis, priority: 14 }, // REGEX
  { logMessageType: LogMessageType.MultilineBraces, priority: 15 }, // REGEX
].sort((a, b) => a.priority - b.priority);
