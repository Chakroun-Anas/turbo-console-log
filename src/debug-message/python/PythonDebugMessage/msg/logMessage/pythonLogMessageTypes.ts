export enum PythonLogMessageType {
  // Context-aware (highest priority — must be checked first)
  FunctionParameter = 'FunctionParameter',       // def foo(x):
  WithinReturnStatement = 'WithinReturnStatement', // return x
  WithinConditionBlock = 'WithinConditionBlock',   // if x: / while x:
  WithinForLoop = 'WithinForLoop',                 // for x in ...:

  // Expression types
  ListComprehension = 'ListComprehension', // [x for x in ...]
  FString = 'FString',                     // f"...{x}..."
  Ternary = 'Ternary',                     // x if cond else y
  BinaryExpression = 'BinaryExpression',   // x + y

  // Assignment patterns (most specific → least specific)
  MethodCallAssignment = 'MethodCallAssignment',         // x = obj.method()
  FunctionCallAssignment = 'FunctionCallAssignment',     // x = func()
  PropertyAccessAssignment = 'PropertyAccessAssignment', // x = obj.attr
  ArrayElementAssignment = 'ArrayElementAssignment',     // x = arr[0] / arr[0] = v
  AugmentedAssignment = 'AugmentedAssignment',           // x += 1
  PrimitiveAssignment = 'PrimitiveAssignment',           // x = 42 / "str" / True / None

  // Fallback
  WanderingExpression = 'WanderingExpression',
}

export type PythonLogMessage = {
  logMessageType: PythonLogMessageType;
  metadata?: Record<string, unknown>;
};

export type PythonLogMessageCheckerResult = {
  isChecked: boolean;
  metadata?: PythonLogMessage['metadata'];
};
