// Type definitions
export type {
  AcornNode,
  Literal,
  Identifier,
  ThisExpression,
  MemberExpression,
  VariableDeclarator,
  VariableDeclaration,
  ObjectPattern,
  ArrayPattern,
  Property,
  TemplateLiteral,
  TaggedTemplateExpression,
  ArrayExpression,
  ObjectExpression,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  BinaryExpression,
  LogicalExpression,
  ConditionalExpression,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  AssignmentExpression,
  ParenthesizedExpression,
  TSAsExpression,
  TSTypeAssertion,
  AwaitExpression,
  RestElement,
  AssignmentPattern,
  ChainExpression,
  NewExpression,
  ImportExpression,
  YieldExpression,
  TSNonNullExpression,
  TSSatisfiesExpression,
  MethodDefinition,
  ClassMethod,
  TSParameterProperty,
  PropertyDefinition,
  CatchClause,
} from './types';

// Type guards
export {
  isLiteral,
  isIdentifier,
  isThisExpression,
  isMemberExpression,
  isVariableDeclaration,
  isObjectPattern,
  isArrayPattern,
  isTemplateLiteral,
  isTaggedTemplateExpression,
  isArrayExpression,
  isObjectExpression,
  isCallExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isArrowFunctionExpression,
  isBinaryExpression,
  isLogicalExpression,
  isConditionalExpression,
  isReturnStatement,
  isBlockStatement,
  isExpressionStatement,
  isAssignmentExpression,
  isParenthesizedExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isAwaitExpression,
  isRestElement,
  isAssignmentPattern,
  isChainExpression,
  isNewExpression,
  isImportExpression,
  isYieldExpression,
  isTSNonNullExpression,
  isTSSatisfiesExpression,
  isMethodDefinition,
  isClassMethod,
  isProperty,
  isClassDeclaration,
  isVariableDeclarator,
  isTSParameterProperty,
  isPropertyDefinition,
  isCatchClause,
  STATEMENT_TYPES,
} from './guards';

// AST walker
export { walk } from './walk';

// Shared resolution helpers
export { isCallLikeExpression } from './callLike';
export { isTransparentWrapper, unwrapTransparent } from './transparentWrapper';
export {
  parameterList,
  patternBindingIdentifiers,
  patternBindsName,
  findBindingDeclaration,
} from './bindings';
export {
  findEnclosingStatement,
  isInStatementHead,
  ifConsequentBlock,
  ifBodyFirstLine,
  statementAnchorStart,
  statementHeads,
  statementLines,
  type EnclosingStatement,
  type StatementLines,
} from './enclosingStatement';
export {
  findObjectLiteralKey,
  type ObjectLiteralKey,
  type ObjectLiteralRoot,
} from './objectLiteralKey';
export { findSelectionReturnStatement } from './returnStatement';
export {
  findAssignmentStatement,
  type AssignmentStatement,
} from './assignmentStatement';

// Parser
export { parseCode } from './parseCode';

// AST utilities
export { adjustASTLocations } from './adjustASTLocations';
