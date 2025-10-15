import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isArrayExpression,
  isArrayPattern,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  walk,
} from '../../acorn-utils';

/**
 * Helper to get full property name like "config.module.rules"
 */
function getFullPropertyName(node: AcornNode): string {
  const parts: string[] = [];

  let current: AcornNode = node;

  // Safeguards against infinite loops
  const visited = new Set<AcornNode>();
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested member expressions
  let depth = 0;

  while (
    isMemberExpression(current) &&
    depth < MAX_DEPTH &&
    !visited.has(current)
  ) {
    visited.add(current);
    depth++;
    if (current.computed) {
      // Don't support computed property access like obj[key]
      return '';
    }
    if (isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    }
    current = current.object;
  }
  if (isIdentifier(current)) {
    parts.unshift(current.name);
  }

  // Log safety limit hits for debugging
  if (depth >= MAX_DEPTH) {
    console.warn(
      `getFullPropertyName: Hit max depth limit (${MAX_DEPTH}) - preventing infinite loop`,
    );
  }
  if (current && visited.has(current)) {
    console.warn(
      `getFullPropertyName: Detected cycle in member expression chain - preventing infinite loop`,
    );
  }

  return parts.join('.');
}

export function arrayAssignmentChecker(
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

    // Check if node has location information
    if (!node.loc) return;

    const startLine = node.loc.start.line - 1; // Acorn uses 1-based lines
    const endLine = node.loc.end.line - 1;

    // Case 1: const items = [1, 2, 3]
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        const { id, init } = decl;

        if (!init) continue;

        // Check if declaration is on the selection line
        if (!decl.loc) continue;
        const declLine = decl.loc.start.line - 1;
        if (declLine !== selectionLine) continue;

        // Simple array assignment: const items = [1, 2, 3]
        if (
          isIdentifier(id) &&
          id.name === variableName &&
          isArrayExpression(init)
        ) {
          isChecked = true;
          return true;
        }

        // Array destructuring: const [a, b] = [1, 2]
        if (isArrayPattern(id) && isArrayExpression(init)) {
          const found = id.elements.some(
            (el) => el && isIdentifier(el) && el.name === variableName,
          );
          if (found) {
            isChecked = true;
            return true;
          }
        }
      }
    }

    // Case 2: config.module.rules = [...]
    if (isExpressionStatement(node)) {
      const expr = node.expression;

      if (selectionLine < startLine || selectionLine > endLine) return;

      if (isAssignmentExpression(expr) && expr.operator === '=') {
        const { left, right } = expr;

        if (isArrayExpression(right) && isMemberExpression(left)) {
          const fullName = getFullPropertyName(left);
          if (fullName === variableName) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}
