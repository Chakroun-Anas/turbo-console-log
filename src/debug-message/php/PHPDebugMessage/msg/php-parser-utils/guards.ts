import type { PHPNode } from './types';

/**
 * Type guard functions for PHP AST nodes.
 * These help safely determine the type of a node during AST traversal.
 */

export function isVariable(
  node: PHPNode | null | undefined,
): node is import('./types').Variable {
  return node?.kind === 'variable';
}

export function isAssign(
  node: PHPNode | null | undefined,
): node is import('./types').Assign {
  return node?.kind === 'assign';
}

export function isAssignRef(
  node: PHPNode | null | undefined,
): node is import('./types').AssignRef {
  return node?.kind === 'assignref';
}

export function isCall(
  node: PHPNode | null | undefined,
): node is import('./types').Call {
  return node?.kind === 'call';
}

export function isFunction(
  node: PHPNode | null | undefined,
): node is import('./types').Function {
  return node?.kind === 'function';
}

export function isArrowFunc(
  node: PHPNode | null | undefined,
): node is import('./types').ArrowFunc {
  return node?.kind === 'arrowfunc';
}

export function isClosure(
  node: PHPNode | null | undefined,
): node is import('./types').Closure {
  return node?.kind === 'closure';
}

export function isMethod(
  node: PHPNode | null | undefined,
): node is import('./types').Method {
  return node?.kind === 'method';
}

export function isClass(
  node: PHPNode | null | undefined,
): node is import('./types').Class {
  return node?.kind === 'class';
}

export function isProperty(
  node: PHPNode | null | undefined,
): node is import('./types').Property {
  return node?.kind === 'property';
}

export function isPropertyStatement(
  node: PHPNode | null | undefined,
): node is import('./types').PropertyStatement {
  return node?.kind === 'propertystatement';
}

export function isArray(
  node: PHPNode | null | undefined,
): node is import('./types').Array {
  return node?.kind === 'array';
}

export function isIf(
  node: PHPNode | null | undefined,
): node is import('./types').If {
  return node?.kind === 'if';
}

export function isFor(
  node: PHPNode | null | undefined,
): node is import('./types').For {
  return node?.kind === 'for';
}

export function isForeach(
  node: PHPNode | null | undefined,
): node is import('./types').Foreach {
  return node?.kind === 'foreach';
}

export function isWhile(
  node: PHPNode | null | undefined,
): node is import('./types').While {
  return node?.kind === 'while';
}

export function isReturn(
  node: PHPNode | null | undefined,
): node is import('./types').Return {
  return node?.kind === 'return';
}

export function isBlock(
  node: PHPNode | null | undefined,
): node is import('./types').Block {
  return node?.kind === 'block';
}

export function isNamespace(
  node: PHPNode | null | undefined,
): node is import('./types').Namespace {
  return node?.kind === 'namespace';
}

export function isTrait(
  node: PHPNode | null | undefined,
): node is import('./types').Trait {
  return node?.kind === 'trait';
}

export function isTraitUse(
  node: PHPNode | null | undefined,
): node is import('./types').TraitUse {
  return node?.kind === 'traituse';
}

export function isBin(
  node: PHPNode | null | undefined,
): node is import('./types').Bin {
  return node?.kind === 'bin';
}

export function isUnary(
  node: PHPNode | null | undefined,
): node is import('./types').Unary {
  return node?.kind === 'unary';
}

export function isPropertyLookup(
  node: PHPNode | null | undefined,
): node is import('./types').PropertyLookup {
  return node?.kind === 'propertylookup';
}

export function isStaticLookup(
  node: PHPNode | null | undefined,
): node is import('./types').StaticLookup {
  return node?.kind === 'staticlookup';
}

export function isOffsetLookup(
  node: PHPNode | null | undefined,
): node is import('./types').OffsetLookup {
  return node?.kind === 'offsetlookup';
}

export function isTernary(
  node: PHPNode | null | undefined,
): node is import('./types').Ternary {
  return node?.kind === 'retif';
}

export function isEcho(
  node: PHPNode | null | undefined,
): node is import('./types').Echo {
  return node?.kind === 'echo';
}

export function isPrint(
  node: PHPNode | null | undefined,
): node is import('./types').Print {
  return node?.kind === 'print';
}

export function isIdentifier(
  node: PHPNode | null | undefined,
): node is import('./types').Identifier {
  return node?.kind === 'identifier';
}

export function isLiteral(
  node: PHPNode | null | undefined,
): node is import('./types').Literal {
  return (
    node?.kind === 'string' ||
    node?.kind === 'number' ||
    node?.kind === 'boolean' ||
    node?.kind === 'null'
  );
}

export function isExpressionStatement(
  node: PHPNode | null | undefined,
): node is import('./types').ExpressionStatement {
  return node?.kind === 'expressionstatement';
}

/**
 * Check if a node represents a function-like construct
 * (regular function, arrow function, closure, or method)
 */
export function isFunctionLike(node: PHPNode | null | undefined): boolean {
  return (
    isFunction(node) || isArrowFunc(node) || isClosure(node) || isMethod(node)
  );
}

/**
 * Check if a node represents a loop construct
 */
export function isLoop(node: PHPNode | null | undefined): boolean {
  return isFor(node) || isForeach(node) || isWhile(node);
}

/**
 * Check if a node represents a class-like construct
 */
export function isClassLike(node: PHPNode | null | undefined): boolean {
  return isClass(node) || isTrait(node);
}

export function isEncapsed(
  node: PHPNode | null | undefined,
): node is import('./types').Encapsed {
  return node?.kind === 'encapsed';
}

export function isEncapsedPart(
  node: PHPNode | null | undefined,
): node is import('./types').EncapsedPart {
  return node?.kind === 'encapsedpart';
}
