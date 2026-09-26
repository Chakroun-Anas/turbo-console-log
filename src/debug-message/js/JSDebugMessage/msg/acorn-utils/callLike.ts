import type { AcornNode } from './types';
import {
  isAwaitExpression,
  isCallExpression,
  isChainExpression,
  isImportExpression,
  isLogicalExpression,
  isNewExpression,
  isYieldExpression,
} from './guards';
import { isTransparentWrapper } from './transparentWrapper';

/**
 * Whether an expression evaluates to the result of a call: a call, `new X()` or
 * a dynamic `import()`, possibly reached through wrappers that pass the call's
 * value on (`await`, `yield`, a logical default, an optional chain,
 * parentheses and TS assertions).
 *
 * Shared by the call-assignment checkers and the call line helper so that
 * every initializer classified as a call is also anchored as one.
 */
export function isCallLikeExpression(node: AcornNode | null): boolean {
  if (!node) return false;

  if (
    isCallExpression(node) ||
    isNewExpression(node) ||
    isImportExpression(node)
  ) {
    return true;
  }

  if (isAwaitExpression(node) || isYieldExpression(node)) {
    return isCallLikeExpression(node.argument);
  }

  if (isLogicalExpression(node)) {
    return isCallLikeExpression(node.left) || isCallLikeExpression(node.right);
  }

  if (isChainExpression(node) || isTransparentWrapper(node)) {
    return isCallLikeExpression(node.expression);
  }

  return false;
}
