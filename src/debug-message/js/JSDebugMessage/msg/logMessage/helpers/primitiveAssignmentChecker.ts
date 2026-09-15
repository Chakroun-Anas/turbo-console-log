import {
  type AcornNode,
  isLiteral,
  isIdentifier,
  isThisExpression,
  isMemberExpression,
  isVariableDeclaration,
  isTemplateLiteral,
  patternBindsName,
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

        // const foo = 42; const { user, role = 'guest' } = state; const [a] = pair;
        if (patternBindsName(id, variableName)) {
          isChecked = true;
          return true;
        }
      }
    }
  });

  return { isChecked };
}
