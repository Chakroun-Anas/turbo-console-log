import { PythonLogMessageType } from '../pythonLogMessageTypes';

export const pythonLogTypeOrder: Array<{
  logMessageType: PythonLogMessageType;
  priority: number;
}> = [
  { logMessageType: PythonLogMessageType.FunctionParameter, priority: 1 },
  { logMessageType: PythonLogMessageType.WithinReturnStatement, priority: 2 },
  { logMessageType: PythonLogMessageType.WithinConditionBlock, priority: 3 },
  { logMessageType: PythonLogMessageType.WithinForLoop, priority: 4 },
  { logMessageType: PythonLogMessageType.ListComprehension, priority: 5 },
  { logMessageType: PythonLogMessageType.FString, priority: 6 },
  { logMessageType: PythonLogMessageType.Ternary, priority: 7 },
  { logMessageType: PythonLogMessageType.BinaryExpression, priority: 8 },
  { logMessageType: PythonLogMessageType.MethodCallAssignment, priority: 9 },
  { logMessageType: PythonLogMessageType.FunctionCallAssignment, priority: 10 },
  { logMessageType: PythonLogMessageType.PropertyAccessAssignment, priority: 11 },
  { logMessageType: PythonLogMessageType.ArrayElementAssignment, priority: 12 },
  { logMessageType: PythonLogMessageType.AugmentedAssignment, priority: 13 },
  { logMessageType: PythonLogMessageType.PrimitiveAssignment, priority: 14 },
  { logMessageType: PythonLogMessageType.WanderingExpression, priority: 15 },
];
