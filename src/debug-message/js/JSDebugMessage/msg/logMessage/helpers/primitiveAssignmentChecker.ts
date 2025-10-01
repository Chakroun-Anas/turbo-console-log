import {
  type AcornNode,
  isLiteral,
  isIdentifier,
  isThisExpression,
  isMemberExpression,
  isVariableDeclaration,
  isObjectPattern,
  isTemplateLiteral,
  isProperty,
  isRestElement,
  walk,
} from '../../acorn-utils';

function isPrimitiveRHS(expr: AcornNode): boolean {
  // Literal values (numbers, strings, booleans, null)
  if (isLiteral(expr)) {
    return true;
  }

  // Template literals without substitutions
  if (isTemplateLiteral(expr) && expr.expressions.length === 0) {
    return true;
  }

  // Bare identifiers like `foo`
  if (isIdentifier(expr)) {
    return true;
  }

  // `this` keyword
  if (isThisExpression(expr)) {
    return true;
  }

  // Property access chains like `user.profile.details`
  if (isMemberExpression(expr)) {
    let node: AcornNode = expr;
    const visited = new Set<AcornNode>();
    let depth = 0;
    const MAX_DEPTH = 1000;

    while (isMemberExpression(node)) {
      // Safeguards against infinite loops
      if (depth >= MAX_DEPTH) {
        console.warn(
          `isPrimitiveRHS: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
        );
        return false;
      }
      if (visited.has(node)) {
        return false;
      }
      visited.add(node);
      depth++;

      // Only allow non-computed property access (dot notation)
      if (node.computed) return false;
      if (!isIdentifier(node.property)) return false;
      node = node.object;
    }
    return isIdentifier(node) || isThisExpression(node);
  }

  return false;
}

/**
 * Recursively searches for a variable name within a destructuring pattern.
 * Handles nested destructuring like: const { props: { children } } = this;
 */
function findVariableInPattern(
  pattern: AcornNode,
  variableName: string,
  visited: Set<AcornNode> = new Set(),
  depth = 0,
): boolean {
  // Safety: prevent infinite recursion
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested destructuring
  if (depth >= MAX_DEPTH) {
    console.warn(
      `findVariableInPattern: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  // Safety: prevent circular references
  if (visited.has(pattern)) {
    return false;
  }

  if (!isObjectPattern(pattern)) return false;

  visited.add(pattern);

  // TypeScript types ObjectPattern.properties as Property[], but runtime can include RestElement
  const properties = pattern.properties as AcornNode[];

  for (const prop of properties) {
    // Handle Property nodes: { key: value } or { children }
    if (isProperty(prop)) {
      const value = prop.value;

      // Direct match: { children }
      if (isIdentifier(value) && value.name === variableName) {
        return true;
      }

      // Nested destructuring: { props: { children } }
      if (isObjectPattern(value)) {
        if (findVariableInPattern(value, variableName, visited, depth + 1)) {
          return true;
        }
      }
    }
    // Handle RestElement: { ...rest }
    else if (isRestElement(prop)) {
      const argument = prop.argument;
      if (isIdentifier(argument) && argument.name === variableName) {
        return true;
      }
    }
  }

  return false;
}

export function primitiveAssignmentChecker(
  ast: AcornNode,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  let isChecked = false;

  if (!ast) {
    return { isChecked: false };
  }

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;

    // Check if node has location information
    if (!node.loc) return;

    const start = node.loc.start.line - 1; // Acorn uses 1-based lines
    const end = node.loc.end.line - 1;

    if (selectionLine < start || selectionLine > end) return;

    if (isVariableDeclaration(node) && node.declarations.length > 0) {
      for (const decl of node.declarations) {
        const { id, init } = decl;
        if (!init || !isPrimitiveRHS(init)) continue;

        // Handle direct assignment: const foo = 42;
        if (isIdentifier(id) && id.name === variableName) {
          isChecked = true;
          return true;
        }

        // Handle destructuring (including nested): const { foo } = user; or const { props: { children } } = this;
        if (isObjectPattern(id)) {
          if (findVariableInPattern(id, variableName)) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}
