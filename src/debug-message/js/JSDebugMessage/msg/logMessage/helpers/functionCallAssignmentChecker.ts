import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isCallExpression,
  isObjectExpression,
  isTSAsExpression,
  isTSTypeAssertion,
  isParenthesizedExpression,
  isPropertyDefinition,
  isCallLikeExpression,
  patternBindsName,
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

    // Check if this node is a class property definition (e.g. protected config = new Foo())
    if (isPropertyDefinition(node)) {
      if (!node.loc) return;
      const defStartLine = node.loc.start.line - 1;
      const defEndLine = node.loc.end.line - 1;
      if (selectionLine < defStartLine || selectionLine > defEndLine) return;
      if (!node.value) return;
      if (isIdentifier(node.key) && node.key.name === variableName) {
        if (isCallLikeExpression(node.value)) {
          isChecked = true;
          return true;
        }
      }
    }

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

        // Case: const result = doSomething(); const { data } = await import('x');
        // const [first = 0] = yield call(api);
        if (patternBindsName(id, variableName) && isCallLikeExpression(init)) {
          isChecked = true;
          return true;
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
