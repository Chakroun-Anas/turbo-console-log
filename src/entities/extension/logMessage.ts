export enum LogMessageType {
  ArrayAssignment = 'ArrayAssignment',
  Decorator = 'Decorator',
  MultiLineAnonymousFunction = 'MultiLineAnonymousFunction',
  MultilineBraces = 'MultilineBraces',
  MultilineParenthesis = 'MultilineParenthesis',
  NamedFunction = 'NamedFunction',
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  ObjectFunctionCall = 'ObjectFunctionCall',
  ObjectLiteral = 'ObjectLiteral',
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
}

export type LogBracketMetadata = {
  openingBracketLine: number;
  closingBracketLine: number;
};

export type LogParenthesisMetadata = {
  openingParenthesisLine: number;
  closingParenthesisLine: number;
};

export type NamedFunctionMetadata = {
  line: number;
};

export type LogMessage = {
  logMessageType: LogMessageType;
  metadata?:
    | LogBracketMetadata
    | LogParenthesisMetadata
    | NamedFunctionMetadata
    | unknown;
};
