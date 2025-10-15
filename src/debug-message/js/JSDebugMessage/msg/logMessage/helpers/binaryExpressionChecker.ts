import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isObjectPattern,
  isArrayPattern,
  isExpressionStatement,
  isAssignmentExpression,
  isBinaryExpression,
  isLogicalExpression,
  isParenthesizedExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  walk,
} from '../../acorn-utils';

export function binaryExpressionChecker(
  ast: AcornNode,
  selectionLine: number,
  variableName: string,
): { isChecked: boolean } {
  const wanted = variableName.trim();

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

    // ── ① VARIABLE DECLARATION CASE ────────────────────
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;
        const declStart = decl.loc.start.line - 1;
        const declEnd = decl.loc.end.line - 1;
        if (selectionLine < declStart || selectionLine > declEnd) continue;

        const { id, init } = decl;
        if (!init) continue;

        // IDENTIFIER CASE
        if (isIdentifier(id)) {
          if (id.name === wanted && containsBinary(init)) {
            isChecked = true;
            return true;
          }
        }

        // DESTRUCTURING CASE
        if (isObjectPattern(id) || isArrayPattern(id)) {
          const binding = findBindingElement(id, wanted);
          if (binding && containsBinary(init)) {
            isChecked = true;
            return true;
          }
        }
      }
    }

    // ── ② ASSIGNMENT EXPRESSION CASE ───────────────────
    if (isExpressionStatement(node)) {
      if (selectionLine < start || selectionLine > end) return;

      const expr = node.expression;

      // Check for assignment pattern: identifier = expression
      if (isAssignmentExpression(expr) && expr.operator === '=') {
        // Left side should be our variable identifier
        if (isIdentifier(expr.left) && expr.left.name === wanted) {
          // Right side should contain a binary expression
          if (containsBinary(expr.right)) {
            isChecked = true;
            return true;
          }
        }
      }
    }
  });

  return { isChecked };
}

/*──────────── helpers ────────────*/

function findBindingElement(
  pattern: AcornNode,
  wanted: string,
  visited = new Set<AcornNode>(),
  depth = 0,
): AcornNode | null {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000; // Generous max depth for nested destructuring

  if (depth >= MAX_DEPTH) {
    console.warn(
      `findBindingElement: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return null;
  }

  if (visited.has(pattern)) {
    console.warn(
      `findBindingElement: Detected cycle in destructuring pattern - preventing infinite recursion`,
    );
    return null;
  }

  visited.add(pattern);

  if (isObjectPattern(pattern)) {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property') continue;

      const { value } = prop;

      if (isIdentifier(value) && value.name === wanted) {
        return value;
      }

      if (isObjectPattern(value) || isArrayPattern(value)) {
        const inner = findBindingElement(value, wanted, visited, depth + 1);
        if (inner) return inner;
      }
    }
  }

  if (isArrayPattern(pattern)) {
    for (const el of pattern.elements) {
      if (!el) continue; // Skip holes in array patterns

      if (isIdentifier(el) && el.name === wanted) {
        return el;
      }

      if (isObjectPattern(el) || isArrayPattern(el)) {
        const inner = findBindingElement(el, wanted, visited, depth + 1);
        if (inner) return inner;
      }
    }
  }

  return null;
}

function containsBinary(
  node: AcornNode,
  visited = new Set<AcornNode>(),
  depth = 0,
): boolean {
  // Safeguards against infinite recursion
  const MAX_DEPTH = 1000; // Generous max depth for deeply nested expressions

  if (depth >= MAX_DEPTH) {
    console.warn(
      `containsBinary: Hit max depth limit (${MAX_DEPTH}) - preventing infinite recursion`,
    );
    return false;
  }

  if (visited.has(node)) {
    console.warn(
      `containsBinary: Detected cycle in expression chain - preventing infinite recursion`,
    );
    return false;
  }

  visited.add(node);

  // Unwrap parentheses and type assertions
  if (
    isParenthesizedExpression(node) ||
    isTSAsExpression(node) ||
    isTSTypeAssertion(node)
  ) {
    return containsBinary(node.expression, visited, depth + 1);
  }

  // Direct binary or logical expression check
  if (isBinaryExpression(node) || isLogicalExpression(node)) return true;

  // Recursively check children
  let found = false;
  walk(node, (child: AcornNode): boolean | void => {
    if (found) return true;
    if (child === node) return; // Skip the root node
    if (isBinaryExpression(child) || isLogicalExpression(child)) {
      found = true;
      return true;
    }
  });

  return found;
}
