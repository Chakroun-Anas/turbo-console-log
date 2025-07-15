import { LogMessageType } from '@/entities';

export const logTypeOrder = [
  { logMessageType: LogMessageType.TemplateString, priority: 1 }, // AST
  { logMessageType: LogMessageType.ArrayAssignment, priority: 2 }, // AST
  { logMessageType: LogMessageType.FunctionParameter, priority: 3 }, // AST
  { logMessageType: LogMessageType.ObjectLiteral, priority: 4 }, // AST
  {
    logMessageType: LogMessageType.ObjectFunctionCallAssignment, // AST
    priority: 5,
  },
  {
    logMessageType: LogMessageType.FunctionCallAssignment, // AST
    priority: 6,
  },
  {
    logMessageType: LogMessageType.PropertyMethodCall,
    priority: 7, // AST
  },
  { logMessageType: LogMessageType.Ternary, priority: 8 }, // AST
  { logMessageType: LogMessageType.BinaryExpression, priority: 9 }, // AST
  { logMessageType: LogMessageType.RawPropertyAccess, priority: 10 }, // AST
  { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 11 }, // AST
  { logMessageType: LogMessageType.PrimitiveAssignment, priority: 12 }, // AST
  { logMessageType: LogMessageType.PropertyAccessAssignment, priority: 13 }, // AST
].sort((a, b) => a.priority - b.priority);
