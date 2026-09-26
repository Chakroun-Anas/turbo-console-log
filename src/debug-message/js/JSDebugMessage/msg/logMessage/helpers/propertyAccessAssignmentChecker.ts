import { TextDocument } from 'vscode';
import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  isMemberExpression,
  isChainExpression,
  unwrapTransparent,
  findAssignmentStatement,
  walk,
} from '../../acorn-utils';

/**
 * Helper function to check if a node is a property/element access or optional chain
 */
function isPropertyOrElementAccess(node: AcornNode): boolean {
  const unwrapped = unwrapTransparent(node);
  return isMemberExpression(unwrapped) || isChainExpression(unwrapped);
}

function isPropertyAccessDeclaration(
  ast: AcornNode,
  selectionLine: number,
  variableName: string,
): boolean {
  let isChecked = false;

  walk(ast, (node: AcornNode): boolean | void => {
    if (isChecked) return true;
    if (!isVariableDeclaration(node)) return;

    for (const decl of node.declarations) {
      if (!decl.loc) continue;

      const startLine = decl.loc.start.line - 1; // Acorn uses 1-based lines

      if (startLine !== selectionLine || !decl.init) continue;

      const { id, init } = decl;

      if (
        isIdentifier(id) &&
        id.name === variableName &&
        isPropertyOrElementAccess(init)
      ) {
        isChecked = true;
        return true;
      }
    }
  });

  return isChecked;
}

export function propertyAccessAssignmentChecker(
  ast: AcornNode,
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  if (!ast) {
    return { isChecked: false };
  }

  // Case ①: const value = obj.prop;
  if (isPropertyAccessDeclaration(ast, selectionLine, variableName)) {
    return { isChecked: true };
  }

  // Case ②: a reassignment of the selected target, whatever its value and
  // operator ($scope.users = data; state = {…}; client ??= new Client(…)).
  // The target has to start on the selection line: a selection on a later
  // line of the value is an expression of its own.
  const assignment = findAssignmentStatement(
    ast,
    document.getText(),
    selectionLine,
    variableName,
  );
  const targetLine = assignment?.expression.left.loc?.start.line;

  return { isChecked: targetLine === selectionLine + 1 }; // Acorn lines are 1-based
}
