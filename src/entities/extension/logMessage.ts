export enum LogMessageType {
  ArrayAssignment = 'ArrayAssignment',
  Decorator = 'Decorator',
  MultiLineAnonymousFunction = 'MultiLineAnonymousFunction',
  MultilineBraces = 'MultilineBraces',
  MultilineParenthesis = 'MultilineParenthesis',
  NamedFunction = 'NamedFunction',
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  FunctionCallAssignment = 'FunctionCallAssignment',
  TypedFunctionCallAssignment = 'TypedFunctionCallAssignment',
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  ObjectLiteral = 'ObjectLiteral',
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
  TemplateString = 'TemplateString',
  NullishCoalescing = 'NullishCoalescing',
  PropertyAccessAssignment = 'PropertyAccessAssignment',
}

export type LogContextMetadata = {
  openingContextLine: number;
  closingContextLine: number;
  deepObjectLine: number;
  deepObjectPath: string;
};
export type NamedFunctionMetadata = {
  line: number;
};

export type TernaryExpressionMetadata = {
  lines: number;
};

export type LogMessage = {
  logMessageType: LogMessageType;
  metadata?:
    | LogContextMetadata
    | NamedFunctionMetadata
    | TernaryExpressionMetadata
    | unknown;
};
