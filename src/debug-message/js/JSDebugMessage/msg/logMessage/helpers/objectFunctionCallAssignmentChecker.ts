import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isObjectPattern,
  isArrayPattern,
  isCallExpression,
  isExpressionStatement,
  isAssignmentExpression,
  isMemberExpression,
  isObjectExpression,
  isFunctionExpression,
  isArrowFunctionExpression,
  isChainExpression,
  walk,
} from '../../acorn-utils';

/**
 * Helper function to unwrap ChainExpression nodes to get the underlying expression
 */
function unwrapChainExpression(node: AcornNode): AcornNode {
  if (isChainExpression(node)) {
    const chainNode = node as { expression?: AcornNode };
    return chainNode.expression || node;
  }
  return node;
}

export function objectFunctionCallAssignmentChecker(
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

    // Handle variable declarations
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;

        const startLine = decl.loc.start.line - 1; // Acorn uses 1-based lines
        const endLine = decl.loc.end.line - 1;

        if (selectionLine < startLine || selectionLine > endLine || !decl.init)
          continue;

        const { id, init } = decl;
        const unwrappedInit = unwrapChainExpression(init);

        // Case: const result = obj.method() or exec(...) or session?.getUser()?.info()
        if (
          isIdentifier(id) &&
          id.name === variableName &&
          isCallExpression(unwrappedInit)
        ) {
          isChecked = true;
          return true;
        }

        // Case: const { data } = obj.method()
        if (
          isObjectPattern(id) &&
          id.properties.some(
            (prop) =>
              prop.type === 'Property' &&
              isIdentifier(prop.value) &&
              prop.value.name === variableName,
          ) &&
          isCallExpression(unwrappedInit)
        ) {
          isChecked = true;
          return true;
        }

        // Case: const [githubSha] = process.argv.slice(2)
        if (
          isArrayPattern(id) &&
          id.elements.some(
            (el) => el && isIdentifier(el) && el.name === variableName,
          ) &&
          isCallExpression(unwrappedInit)
        ) {
          isChecked = true;
          return true;
        }

        // Case: const result = wrapperFn({ queryFn: () => obj.method() })
        if (
          isIdentifier(id) &&
          id.name === variableName &&
          isCallExpression(unwrappedInit)
        ) {
          const callNode = unwrappedInit as { arguments?: AcornNode[] };
          if (callNode.arguments) {
            for (const arg of callNode.arguments) {
              if (
                isObjectExpression(arg) &&
                arg.properties.some((prop) => {
                  if (
                    prop.type === 'Property' &&
                    (isFunctionExpression(prop.value) ||
                      isArrowFunctionExpression(prop.value))
                  ) {
                    // Search for nested CallExpression with MemberExpression callee
                    let found = false;
                    walk(prop.value, (n) => {
                      if (isCallExpression(n)) {
                        const callee = (n as { callee?: AcornNode }).callee;
                        if (callee && isMemberExpression(callee)) {
                          found = true;
                          return true;
                        }
                      }
                    });
                    return found;
                  }
                  return false;
                })
              ) {
                isChecked = true;
                return true;
              }
            }
          }
        }
      }
    }

    // Handle assignment expressions (e.g., optionalDependencies[key] = optionalDependencies[key].replace(...))
    if (isExpressionStatement(node)) {
      const expr = node.expression;
      if (!expr.loc) return;

      const startLine = expr.loc.start.line - 1;
      const endLine = expr.loc.end.line - 1;

      if (selectionLine < startLine || selectionLine > endLine) return;

      if (isAssignmentExpression(expr)) {
        const { left, right } = expr;

        // Get text representation of left side
        let leftText = '';
        if (isIdentifier(left)) {
          leftText = left.name;
        } else if (isMemberExpression(left)) {
          // For computed member access like obj[key], reconstruct the text
          const obj = left.object;
          const prop = left.property;
          if (isIdentifier(obj) && isIdentifier(prop)) {
            if ((left as { computed?: boolean }).computed) {
              leftText = `${obj.name}[${prop.name}]`;
            } else {
              leftText = `${obj.name}.${prop.name}`;
            }
          }
        }

        const unwrappedRight = unwrapChainExpression(right);
        if (leftText === variableName && isCallExpression(unwrappedRight)) {
          isChecked = true;
          return true;
        }
      }
    }
  });

  return { isChecked };
}
