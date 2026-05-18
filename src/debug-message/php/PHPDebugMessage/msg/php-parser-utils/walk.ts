import type { PHPNode } from './types';

/**
 * AST Walker for PHP nodes.
 * Provides utilities to traverse the PHP AST tree and visit nodes.
 *
 * This is inspired by the acorn-walk library but adapted for php-parser AST structure.
 */

export type Visitor = (node: PHPNode, parent?: PHPNode) => void | boolean;

/**
 * Simple recursive walker for PHP AST.
 * Visits every node in the tree and calls the visitor function.
 * If visitor returns false, stops traversing that branch.
 *
 * @param node The root node to start walking from
 * @param visitor Function called for each node
 * @param parent The parent node (used internally)
 */
export function walk(
  node: PHPNode | null | undefined,
  visitor: Visitor,
  parent?: PHPNode,
): void {
  if (!node) return;

  const shouldContinue = visitor(node, parent);
  if (shouldContinue === false) return;

  // Traverse children based on node kind
  switch (node.kind) {
    case 'program':
      (node as import('./types').Program).children.forEach((child) =>
        walk(child, visitor, node),
      );
      break;

    case 'namespace':
      (node as import('./types').Namespace).children.forEach((child) =>
        walk(child, visitor, node),
      );
      break;

    case 'class':
    case 'trait':
      (node as import('./types').Class | import('./types').Trait).body.forEach(
        (child) => walk(child, visitor, node),
      );
      break;

    case 'function':
    case 'method':
    case 'closure': {
      const funcNode = node as
        | import('./types').Function
        | import('./types').Method
        | import('./types').Closure;
      funcNode.arguments.forEach((arg) => walk(arg, visitor, node));
      if (funcNode.body) walk(funcNode.body, visitor, node);
      if ('uses' in funcNode && funcNode.uses) {
        funcNode.uses.forEach((use) => walk(use, visitor, node));
      }
      break;
    }

    case 'arrowfunc': {
      const arrowNode = node as import('./types').ArrowFunc;
      arrowNode.arguments.forEach((arg) => walk(arg, visitor, node));
      walk(arrowNode.body, visitor, node);
      break;
    }

    case 'block':
      (node as import('./types').Block).children.forEach((child) =>
        walk(child, visitor, node),
      );
      break;

    case 'if': {
      const ifNode = node as import('./types').If;
      walk(ifNode.test, visitor, node);
      walk(ifNode.body, visitor, node);
      if (ifNode.alternate) walk(ifNode.alternate, visitor, node);
      break;
    }

    case 'for': {
      const forNode = node as import('./types').For;
      forNode.init.forEach((init) => walk(init, visitor, node));
      forNode.test.forEach((test) => walk(test, visitor, node));
      forNode.increment.forEach((inc) => walk(inc, visitor, node));
      walk(forNode.body, visitor, node);
      break;
    }

    case 'foreach': {
      const foreachNode = node as import('./types').Foreach;
      walk(foreachNode.source, visitor, node);
      if (foreachNode.key) walk(foreachNode.key, visitor, node);
      walk(foreachNode.value, visitor, node);
      walk(foreachNode.body, visitor, node);
      break;
    }

    case 'while': {
      const whileNode = node as import('./types').While;
      walk(whileNode.test, visitor, node);
      walk(whileNode.body, visitor, node);
      break;
    }

    case 'assign':
    case 'assignref': {
      const assignNode = node as
        | import('./types').Assign
        | import('./types').AssignRef;
      walk(assignNode.left, visitor, node);
      walk(assignNode.right, visitor, node);
      break;
    }

    case 'bin': {
      const binNode = node as import('./types').Bin;
      walk(binNode.left, visitor, node);
      walk(binNode.right, visitor, node);
      break;
    }

    case 'unary':
      walk((node as import('./types').Unary).what, visitor, node);
      break;

    case 'call': {
      const callNode = node as import('./types').Call;
      walk(callNode.what, visitor, node);
      callNode.arguments.forEach((arg) => walk(arg, visitor, node));
      break;
    }

    case 'array':
      (node as import('./types').Array).items.forEach((item) =>
        walk(item, visitor, node),
      );
      break;

    case 'entry': {
      const entryNode = node as import('./types').Entry;
      if (entryNode.key) walk(entryNode.key, visitor, node);
      walk(entryNode.value, visitor, node);
      break;
    }

    case 'propertylookup':
    case 'staticlookup': {
      const lookupNode = node as
        | import('./types').PropertyLookup
        | import('./types').StaticLookup;
      walk(lookupNode.what, visitor, node);
      walk(lookupNode.offset, visitor, node);
      break;
    }

    case 'offsetlookup': {
      const offsetNode = node as import('./types').OffsetLookup;
      walk(offsetNode.what, visitor, node);
      if (offsetNode.offset) walk(offsetNode.offset, visitor, node);
      break;
    }

    case 'retif': {
      const ternaryNode = node as import('./types').Ternary;
      walk(ternaryNode.test, visitor, node);
      if (ternaryNode.trueExpr) walk(ternaryNode.trueExpr, visitor, node);
      walk(ternaryNode.falseExpr, visitor, node);
      break;
    }

    case 'return': {
      const returnNode = node as import('./types').Return;
      if (returnNode.expr) walk(returnNode.expr, visitor, node);
      break;
    }

    case 'echo':
      (node as import('./types').Echo).expressions.forEach((expr) =>
        walk(expr, visitor, node),
      );
      break;

    case 'print':
      (node as import('./types').Print).arguments.forEach((arg) =>
        walk(arg, visitor, node),
      );
      break;

    case 'expressionstatement':
      walk(
        (node as import('./types').ExpressionStatement).expression,
        visitor,
        node,
      );
      break;

    case 'propertystatement':
      (node as import('./types').PropertyStatement).properties.forEach((prop) =>
        walk(prop, visitor, node),
      );
      break;

    case 'traituse':
      (node as import('./types').TraitUse).traits.forEach((trait) =>
        walk(trait, visitor, node),
      );
      break;

    case 'usegroup':
      (node as import('./types').UseGroup).items.forEach((item) =>
        walk(item, visitor, node),
      );
      break;

    // Leaf nodes - no children to traverse
    case 'variable':
    case 'identifier':
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
    case 'parameter':
    case 'property':
    case 'useitem':
      break;

    default: {
      // For any unknown node types, try to find children generically
      const anyNode = node as unknown as Record<string, unknown>;
      Object.values(anyNode).forEach((value) => {
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item && typeof item === 'object' && 'kind' in item) {
                walk(item as PHPNode, visitor, node);
              }
            });
          } else if ('kind' in value) {
            walk(value as PHPNode, visitor, node);
          }
        }
      });
    }
  }
}

/**
 * Find all nodes of a specific kind in the AST.
 *
 * @param ast The root node to search from
 * @param kind The node kind to find
 * @returns Array of matching nodes
 */
export function findAll(ast: PHPNode, kind: string): PHPNode[] {
  const results: PHPNode[] = [];
  walk(ast, (node) => {
    if (node.kind === kind) {
      results.push(node);
    }
  });
  return results;
}

/**
 * Find the first node that matches a predicate.
 *
 * @param ast The root node to search from
 * @param predicate Function to test each node
 * @returns The first matching node or null
 */
export function findFirst(
  ast: PHPNode,
  predicate: (node: PHPNode) => boolean,
): PHPNode | null {
  let result: PHPNode | null = null;
  walk(ast, (node) => {
    if (predicate(node)) {
      result = node;
      return false; // Stop walking
    }
  });
  return result;
}

/**
 * Find the parent node of a given node in the AST.
 *
 * @param ast The root node to search from
 * @param targetNode The node to find the parent of
 * @returns The parent node or null if not found
 */
export function findParent(ast: PHPNode, targetNode: PHPNode): PHPNode | null {
  let parentNode: PHPNode | null = null;
  walk(ast, (node, parent) => {
    if (node === targetNode && parent) {
      parentNode = parent;
      return false; // Stop walking
    }
  });
  return parentNode;
}
