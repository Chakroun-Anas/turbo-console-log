export enum LogMessageType {
  ArrayAssignment = 'ArrayAssignment',
  // MultiLineAnonymousFunction = 'MultiLineAnonymousFunction',
  // MultilineBraces = 'MultilineBraces',
  // MultilineParenthesis = 'MultilineParenthesis',
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  RawPropertyAccess = 'RawPropertyAccess',
  FunctionCallAssignment = 'FunctionCallAssignment',
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  ObjectLiteral = 'ObjectLiteral',
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
  BinaryExpression = 'BinaryExpression',
  TemplateString = 'TemplateString',
  PropertyAccessAssignment = 'PropertyAccessAssignment',
  FunctionParameter = 'FunctionParameter',
  PropertyMethodCall = 'PropertyMethodCall',
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
