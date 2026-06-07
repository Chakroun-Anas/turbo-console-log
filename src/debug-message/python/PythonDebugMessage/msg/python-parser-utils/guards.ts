import type { SyntaxNode } from '@lezer/common';

export function isAssignStatement(node: SyntaxNode): boolean {
  return node.type.name === 'AssignStatement';
}

/** Augmented assignment: x += 1, x -= y, x *= 2, etc.
 *  Lezer Python uses "UpdateStatement" for this construct. */
export function isAugmentedAssignStatement(node: SyntaxNode): boolean {
  return node.type.name === 'UpdateStatement';
}

export function isFunctionDefinition(node: SyntaxNode): boolean {
  return node.type.name === 'FunctionDefinition';
}

export function isClassDefinition(node: SyntaxNode): boolean {
  return node.type.name === 'ClassDefinition';
}

export function isReturnStatement(node: SyntaxNode): boolean {
  return node.type.name === 'ReturnStatement';
}

export function isIfStatement(node: SyntaxNode): boolean {
  return node.type.name === 'IfStatement';
}

export function isWhileStatement(node: SyntaxNode): boolean {
  return node.type.name === 'WhileStatement';
}

export function isForStatement(node: SyntaxNode): boolean {
  return node.type.name === 'ForStatement';
}

export function isExpressionStatement(node: SyntaxNode): boolean {
  return node.type.name === 'ExpressionStatement';
}

export function isCallExpression(node: SyntaxNode): boolean {
  return node.type.name === 'CallExpression';
}

export function isMemberExpression(node: SyntaxNode): boolean {
  return node.type.name === 'MemberExpression';
}

/**
 * True for dot-access MemberExpression: obj.prop, self.value, etc.
 * Excludes subscript access (arr[0]), which uses "[" as the second child.
 */
export function isDotAccessMemberExpression(node: SyntaxNode): boolean {
  if (node.type.name !== 'MemberExpression') return false;
  const secondChild = node.firstChild?.nextSibling;
  return secondChild?.type.name === '.';
}

/**
 * True for subscript MemberExpression: arr[0], data['key'], matrix[row][col].
 * In Lezer Python, subscript access is also MemberExpression but uses "[" as
 * the second child token instead of ".".
 */
export function isSubscriptExpression(node: SyntaxNode): boolean {
  if (node.type.name !== 'MemberExpression') return false;
  const secondChild = node.firstChild?.nextSibling;
  return secondChild?.type.name === '[';
}

export function isBinaryExpression(node: SyntaxNode): boolean {
  return node.type.name === 'BinaryExpression';
}

export function isConditionalExpression(node: SyntaxNode): boolean {
  return node.type.name === 'ConditionalExpression';
}

export function isFormatString(node: SyntaxNode): boolean {
  return node.type.name === 'FormatString';
}

/** Checks for any Python comprehension: list, set, dict, or generator. */
export function isComprehensionExpression(node: SyntaxNode): boolean {
  return (
    node.type.name === 'ArrayComprehensionExpression' ||
    node.type.name === 'SetComprehensionExpression' ||
    node.type.name === 'DictionaryComprehensionExpression' ||
    node.type.name === 'ComprehensionExpression'
  );
}

export function isVariableName(node: SyntaxNode): boolean {
  return node.type.name === 'VariableName';
}
