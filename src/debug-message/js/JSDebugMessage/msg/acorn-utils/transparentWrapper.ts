import type { AcornNode } from './types';
import {
  isParenthesizedExpression,
  isTSAsExpression,
  isTSNonNullExpression,
  isTSSatisfiesExpression,
  isTSTypeAssertion,
} from './guards';

/**
 * Wrappers that pass their expression's value on unchanged: `( … )`, `as T`,
 * `satisfies T`, `<T>…` and `…!`.
 */
export function isTransparentWrapper(
  node: AcornNode | null | undefined,
): node is AcornNode & { expression: AcornNode } {
  return (
    !!node &&
    (isParenthesizedExpression(node) ||
      isTSAsExpression(node) ||
      isTSSatisfiesExpression(node) ||
      isTSTypeAssertion(node) ||
      isTSNonNullExpression(node))
  );
}

/** The expression under any number of transparent wrappers. */
export function unwrapTransparent(node: AcornNode): AcornNode {
  let current = node;
  while (isTransparentWrapper(current)) current = current.expression;
  return current;
}
