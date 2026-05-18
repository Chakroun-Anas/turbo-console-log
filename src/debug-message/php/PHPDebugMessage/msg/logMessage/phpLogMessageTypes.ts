/**
 * PHP-specific LogMessage types.
 * These mirror the JS/TS types but can evolve independently for PHP specifics.
 */

export enum PHPLogMessageType {
  ArrayAssignment = 'ArrayAssignment',
  // NamedFunctionAssignment = 'NamedFunctionAssignment', // JS/TS specific, not used in PHP
  // RawPropertyAccess = 'RawPropertyAccess', // JS/TS specific, not used in PHP
  FunctionCallAssignment = 'FunctionCallAssignment',
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  // ObjectLiteral = 'ObjectLiteral', // JS/TS specific, not used in PHP
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
  BinaryExpression = 'BinaryExpression',
  StringInterpolation = 'StringInterpolation',
  PropertyAccessAssignment = 'PropertyAccessAssignment',
  FunctionParameter = 'FunctionParameter',
  PropertyMethodCall = 'PropertyMethodCall',
  WithinReturnStatement = 'WithinReturnStatement',
  WithinConditionBlock = 'WithinConditionBlock',
  WanderingExpression = 'WanderingExpression',
  // PHP-specific types we might add later:
  // StaticPropertyAccess = 'StaticPropertyAccess',
  // NamespaceFunction = 'NamespaceFunction',
  // MagicMethod = 'MagicMethod',
}

export type PHPLogContextMetadata = {
  openingContextLine: number;
  closingContextLine: number;
  deepObjectLine?: number;
  deepObjectPath?: string;
};

export type PHPTernaryExpressionMetadata = {
  ternaryLine: number;
};

export type PHPLogMessage = {
  logMessageType: PHPLogMessageType;
  metadata?:
    | PHPLogContextMetadata
    | PHPTernaryExpressionMetadata
    | Record<string, unknown>;
};

export type PHPLogMessageCheckerResult = {
  isChecked: boolean;
  metadata?: PHPLogMessage['metadata'];
};
