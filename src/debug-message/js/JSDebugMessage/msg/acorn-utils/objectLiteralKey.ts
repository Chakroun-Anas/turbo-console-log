import type {
  AcornNode,
  ExpressionStatement,
  Property,
  VariableDeclaration,
  VariableDeclarator,
} from './types';
import {
  STATEMENT_TYPES,
  isAssignmentExpression,
  isExpressionStatement,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isProperty,
  isVariableDeclaration,
  isVariableDeclarator,
} from './guards';
import { type EnclosingStatement } from './enclosingStatement';
import { isTransparentWrapper } from './transparentWrapper';
import { walk } from './walk';

/**
 * What the outermost object literal of a key chain is bound to:
 * - `declaration`: `const config = { … }`, the key is reachable as `config.…`
 * - `assignment`: `this.state = { … };`, the key is reachable as `this.state.…`
 * - `none`: returned, passed as an argument, exported as default, …
 */
export type ObjectLiteralRoot =
  | { kind: 'declaration'; declaration: VariableDeclaration; name: string }
  | { kind: 'assignment'; statement: ExpressionStatement; target: AcornNode }
  | { kind: 'none' };

export type ObjectLiteralKey = {
  /** The property whose key is the selection. */
  property: Property;
  /** Properties from the outermost object literal down to `property`. */
  keyPath: Property[];
  /** The outermost object literal of the chain. */
  literal: AcornNode;
  root: ObjectLiteralRoot;
  /**
   * The innermost statement around `literal` in the same function scope
   * (an `export default` counts as one). Undefined when a function or class
   * boundary comes first.
   */
  enclosing?: EnclosingStatement;
};

const FUNCTION_BOUNDARY_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassBody',
  'StaticBlock',
]);

/**
 * The object-literal property whose identifier key named `name` covers the
 * `[start, end]` offsets, with the chain of keys and the root it hangs from.
 * Destructuring patterns are not object literals and never match.
 */
export function findObjectLiteralKey(
  ast: AcornNode,
  start: number,
  end: number,
  name: string,
): ObjectLiteralKey | undefined {
  const chain = ancestorChain(ast, start, end);
  const propertyIndex = findKeyIndex(chain, start, end, name);
  if (propertyIndex < 1 || !isObjectExpression(chain[propertyIndex - 1])) {
    return undefined;
  }

  const property = chain[propertyIndex] as Property;
  const keyPath = [property];
  let literalIndex = propertyIndex - 1;

  // Climb `{ a: { b: … } }` nesting: a literal that is the value of a
  // property of an enclosing literal belongs to the same chain.
  for (;;) {
    const parentIndex = parentIndexOf(chain, literalIndex);
    const parent = chain[parentIndex];
    if (
      !parent ||
      !isProperty(parent) ||
      parent.value !== chain[parentIndex + 1] ||
      !isObjectExpression(chain[parentIndex - 1])
    ) {
      break;
    }
    keyPath.unshift(parent);
    literalIndex = parentIndex - 1;
  }

  return {
    property,
    keyPath,
    literal: chain[literalIndex],
    root: resolveRoot(chain, literalIndex),
    enclosing: enclosingStatement(chain, literalIndex),
  };
}

/**
 * Every node whose range covers `[start, end]`, outermost first: the path from
 * the root to the selection (shorthand properties add their key and value
 * copies at the end, which is harmless for climbing).
 */
function ancestorChain(ast: AcornNode, start: number, end: number) {
  const chain: AcornNode[] = [];
  walk(ast, (node: AcornNode): boolean | void => {
    if (node.start > start || node.end < end) return true; // Skip the subtree
    chain.push(node);
  });
  return chain;
}

function findKeyIndex(
  chain: AcornNode[],
  start: number,
  end: number,
  name: string,
): number {
  for (let index = chain.length - 1; index >= 0; index--) {
    const node = chain[index];
    if (
      isProperty(node) &&
      isIdentifier(node.key) &&
      node.key.name === name &&
      node.key.start <= start &&
      node.key.end >= end
    ) {
      return index;
    }
  }
  return -1;
}

/** Index of the nearest ancestor that is not a transparent expression wrapper. */
function parentIndexOf(chain: AcornNode[], index: number): number {
  let parentIndex = index - 1;
  while (parentIndex >= 0 && isTransparentWrapper(chain[parentIndex])) {
    parentIndex--;
  }
  return parentIndex;
}

function resolveRoot(
  chain: AcornNode[],
  literalIndex: number,
): ObjectLiteralRoot {
  const parentIndex = parentIndexOf(chain, literalIndex);
  const parent = chain[parentIndex];
  const child = chain[parentIndex + 1];
  const grandparent = chain[parentIndex - 1];
  if (!parent || !grandparent) return { kind: 'none' };

  if (isVariableDeclarator(parent) && isVariableDeclaration(grandparent)) {
    const { id, init } = parent as VariableDeclarator;
    if (init === child && isIdentifier(id)) {
      return { kind: 'declaration', declaration: grandparent, name: id.name };
    }
  }

  if (
    isAssignmentExpression(parent) &&
    parent.right === child &&
    (isIdentifier(parent.left) || isMemberExpression(parent.left)) &&
    isExpressionStatement(grandparent)
  ) {
    return { kind: 'assignment', statement: grandparent, target: parent.left };
  }

  return { kind: 'none' };
}

function enclosingStatement(
  chain: AcornNode[],
  literalIndex: number,
): EnclosingStatement | undefined {
  for (let index = literalIndex - 1; index >= 0; index--) {
    const node = chain[index];
    if (FUNCTION_BOUNDARY_TYPES.has(node.type)) return undefined;
    if (STATEMENT_TYPES.has(node.type)) {
      const parent = chain[index - 1];
      const isElseIf =
        node.type === 'IfStatement' &&
        parent?.type === 'IfStatement' &&
        (parent as AcornNode & { alternate?: AcornNode }).alternate === node;
      return { statement: node, isElseIf };
    }
  }
  return undefined;
}
