import {
  type AcornNode,
  type ObjectPattern,
  type ArrayPattern,
  type RestElement,
  type AssignmentPattern,
  isVariableDeclaration,
  isIdentifier,
  isCallExpression,
  isAwaitExpression,
  isObjectExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isParenthesizedExpression,
  isLogicalExpression,
  walk,
} from '../../acorn-utils';

export function functionCallAssignmentChecker(
  ast: AcornNode,
  selectionLine: number,
  variableName: string,
) {
  let isChecked = false;

  if (!ast) {
    return { isChecked: false };
  }

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Check if this node is a variable declaration and process it
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;
        const declStartLine = decl.loc.start.line - 1; // Acorn uses 1-based lines
        const declEndLine = decl.loc.end.line - 1;

        // Check if selection line is within the declaration's range
        if (selectionLine < declStartLine || selectionLine > declEndLine)
          continue;

        const { id, init } = decl;
        if (!init) continue;

        // Case: const result = doSomething();
        if (isIdentifier(id) && id.name === variableName) {
          if (containsFunctionCall(init)) {
            isChecked = true;
            return true;
          }
        }

        // Case: const { data } = doSomething(); or const [first] = doSomething();
        if (id.type === 'ObjectPattern' || id.type === 'ArrayPattern') {
          const hasMatchingProperty = findVariableInPattern(id, variableName);

          if (hasMatchingProperty && containsFunctionCall(init)) {
            isChecked = true;
            return true;
          }
        }

        // Case: const obj = { result: doSomething() }
        if (isIdentifier(id) && isObjectExpression(init)) {
          for (const prop of init.properties) {
            if (
              prop.type === 'Property' &&
              isIdentifier(prop.key) &&
              prop.key.name === variableName &&
              isCallExpression(unwrapExpression(prop.value))
            ) {
              isChecked = true;
              return true;
            }
          }
        }
      }
    }
  });

  return { isChecked };
}

function unwrapExpression(expr: AcornNode): AcornNode {
  // Safeguards against infinite loops
  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested expressions
  let depth = 0;

  while (
    (isTSAsExpression(expr) ||
      isTSTypeAssertion(expr) ||
      isParenthesizedExpression(expr)) &&
    depth < MAX_DEPTH &&
    !visited.has(expr)
  ) {
    visited.add(expr);
    depth++;
    expr = expr.expression;
  }

  // Log safety limit hits for debugging
  if (depth >= MAX_DEPTH) {
    console.warn(
      `unwrapExpression: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
    );
  }

  return expr;
}

/**
 * Recursively checks if an expression contains any function call,
 * handling complex nested expressions with await, logical operators, etc.
 */
function containsFunctionCall(expr: AcornNode): boolean {
  if (!expr) return false;

  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000;
  let depth = 0;

  function check(node: AcornNode): boolean {
    if (!node || visited.has(node) || depth++ >= MAX_DEPTH) return false;
    visited.add(node);

    // Direct function call
    if (isCallExpression(node)) return true;

    // Await expression: check the awaited expression
    if (isAwaitExpression(node)) {
      return check(node.argument);
    }

    // Logical expression: check both sides
    if (isLogicalExpression(node)) {
      return check(node.left) || check(node.right);
    }

    // Unwrap type assertions and parentheses
    if (
      isTSAsExpression(node) ||
      isTSTypeAssertion(node) ||
      isParenthesizedExpression(node)
    ) {
      return check(node.expression);
    }

    return false;
  }

  return check(expr);
}

/**
 * Recursively searches for a variable name within destructuring patterns.
 * Handles nested object and array destructuring patterns.
 */
function findVariableInPattern(
  pattern: AcornNode,
  variableName: string,
): boolean {
  if (!pattern) return false;

  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000;
  let depth = 0;

  function search(node: AcornNode): boolean {
    if (!node || visited.has(node) || depth++ >= MAX_DEPTH) return false;
    visited.add(node);

    // Direct identifier match
    if (isIdentifier(node) && node.name === variableName) {
      return true;
    }

    // Object pattern: { key: value, key2, ...rest }
    if (node.type === 'ObjectPattern') {
      const objPattern = node as ObjectPattern;
      for (const prop of objPattern.properties || []) {
        if (prop.type === 'Property') {
          // Check value (e.g., { key: variable })
          if (search(prop.value)) return true;
        } else if (prop.type === 'RestElement') {
          // Check rest element (e.g., { ...rest })
          const restProp = prop as unknown as RestElement;
          if (search(restProp.argument)) return true;
        }
      }
    }

    // Array pattern: [first, second, ...rest]
    if (node.type === 'ArrayPattern') {
      const arrPattern = node as ArrayPattern;
      for (const element of arrPattern.elements || []) {
        if (element && search(element)) return true;
      }
    }

    // Rest element: ...variable
    if (node.type === 'RestElement') {
      const restElement = node as RestElement;
      return search(restElement.argument);
    }

    // Assignment pattern: variable = defaultValue
    if (node.type === 'AssignmentPattern') {
      const assignPattern = node as AssignmentPattern;
      return search(assignPattern.left);
    }

    return false;
  }

  return search(pattern);
}
