import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isObjectExpression,
  walk,
} from '../../acorn-utils';

export function objectLiteralChecker(
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

    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (!decl.loc) continue;

        const startLine = decl.loc.start.line - 1; // Acorn uses 1-based lines

        if (startLine !== selectionLine || !decl.init) continue;

        const { id, init } = decl;

        // Check if it's a direct object literal assignment: const config = { ... }
        if (
          isIdentifier(id) &&
          id.name === variableName &&
          isObjectExpression(init)
        ) {
          isChecked = true;
          return true;
        }
      }
    }
  });

  return { isChecked };
}
