import type {
  AcornNode,
  Literal,
  Identifier,
  ThisExpression,
  MemberExpression,
  VariableDeclaration,
  ObjectPattern,
  ArrayPattern,
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
  MethodDefinition,
  ClassMethod,
  Property,
  TSParameterProperty,
} from './types';

export function isLiteral(node: AcornNode): node is Literal {
  return node.type === 'Literal';
}

export function isIdentifier(node: AcornNode): node is Identifier {
  return node.type === 'Identifier';
}

export function isThisExpression(node: AcornNode): node is ThisExpression {
  return node.type === 'ThisExpression';
}

export function isMemberExpression(node: AcornNode): node is MemberExpression {
  return node.type === 'MemberExpression';
}

export function isVariableDeclaration(
  node: AcornNode,
): node is VariableDeclaration {
  return node.type === 'VariableDeclaration';
}

export function isObjectPattern(node: AcornNode): node is ObjectPattern {
  return node.type === 'ObjectPattern';
}

export function isArrayPattern(node: AcornNode): node is ArrayPattern {
  return node.type === 'ArrayPattern';
}

export function isTemplateLiteral(node: AcornNode): node is TemplateLiteral {
  return node.type === 'TemplateLiteral';
}

export function isTaggedTemplateExpression(
  node: AcornNode,
): node is TaggedTemplateExpression {
  return node.type === 'TaggedTemplateExpression';
}

export function isArrayExpression(node: AcornNode): node is ArrayExpression {
  return node.type === 'ArrayExpression';
}

export function isObjectExpression(node: AcornNode): node is ObjectExpression {
  return node.type === 'ObjectExpression';
}

export function isCallExpression(node: AcornNode): node is CallExpression {
  return node.type === 'CallExpression';
}

export function isFunctionDeclaration(
  node: AcornNode,
): node is FunctionDeclaration {
  return node.type === 'FunctionDeclaration';
}

export function isFunctionExpression(
  node: AcornNode,
): node is FunctionExpression {
  return node.type === 'FunctionExpression';
}

export function isArrowFunctionExpression(
  node: AcornNode,
): node is ArrowFunctionExpression {
  return node.type === 'ArrowFunctionExpression';
}

export function isBinaryExpression(node: AcornNode): node is BinaryExpression {
  return node.type === 'BinaryExpression';
}

export function isLogicalExpression(
  node: AcornNode,
): node is LogicalExpression {
  return node.type === 'LogicalExpression';
}

export function isConditionalExpression(
  node: AcornNode,
): node is ConditionalExpression {
  return node.type === 'ConditionalExpression';
}

export function isReturnStatement(node: AcornNode): node is ReturnStatement {
  return node.type === 'ReturnStatement';
}

export function isBlockStatement(node: AcornNode): node is BlockStatement {
  return node.type === 'BlockStatement';
}

export function isExpressionStatement(
  node: AcornNode,
): node is ExpressionStatement {
  return node.type === 'ExpressionStatement';
}

export function isAssignmentExpression(
  node: AcornNode,
): node is AssignmentExpression {
  return node.type === 'AssignmentExpression';
}

export function isParenthesizedExpression(
  node: AcornNode,
): node is ParenthesizedExpression {
  return node.type === 'ParenthesizedExpression';
}

export function isTSAsExpression(node: AcornNode): node is TSAsExpression {
  return node.type === 'TSAsExpression';
}

export function isTSTypeAssertion(node: AcornNode): node is TSTypeAssertion {
  return node.type === 'TSTypeAssertion';
}

export function isAwaitExpression(node: AcornNode): node is AwaitExpression {
  return node.type === 'AwaitExpression';
}

export function isRestElement(node: AcornNode): node is RestElement {
  return node.type === 'RestElement';
}

export function isAssignmentPattern(
  node: AcornNode,
): node is AssignmentPattern {
  return node.type === 'AssignmentPattern';
}

export function isChainExpression(node: AcornNode): node is ChainExpression {
  return node.type === 'ChainExpression';
}

export function isMethodDefinition(node: AcornNode): node is MethodDefinition {
  return node.type === 'MethodDefinition';
}

export function isClassMethod(node: AcornNode): node is ClassMethod {
  return node.type === 'ClassMethod';
}

export function isProperty(node: AcornNode): node is Property {
  return node.type === 'Property';
}

export function isClassDeclaration(node: AcornNode): boolean {
  return node.type === 'ClassDeclaration';
}

export function isVariableDeclarator(node: AcornNode): boolean {
  return node.type === 'VariableDeclarator';
}

export function isTSParameterProperty(
  node: AcornNode,
): node is TSParameterProperty {
  return node.type === 'TSParameterProperty';
}
